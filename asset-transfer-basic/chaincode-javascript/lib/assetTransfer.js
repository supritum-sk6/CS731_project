'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

// Asset Classes
class User {
    constructor(user_id, name, email, phone_number, is_anonymous) {
        this.user_id = user_id;
        this.name = name;
        this.email = email;
        this.phone_number = phone_number;
        this.is_anonymous = is_anonymous;
        this.docType = 'user';
    }
}

class ServiceProvider {
    constructor(provider_id, company_name, contact_email, contact_phone, modes_of_transport, hashed_password) {
        this.provider_id = provider_id;
        this.company_name = company_name;
        this.contact_email = contact_email;
        this.contact_phone = contact_phone;
        this.modes_of_transport = modes_of_transport;
        this.hashed_password = hashed_password
        this.docType = 'provider';
    }
}

class TransportOption {
    constructor(transport_id, provider_id, mode_of_transport, source, destination, departure_time, arrival_time, price, dynamic_price_factor, total_seats) {
        this.transport_id = transport_id;
        this.provider_id = provider_id;
        this.mode_of_transport = mode_of_transport;
        this.source = source;
        this.destination = destination;
        this.departure_time = departure_time;
        this.arrival_time = arrival_time;
        this.price = price;
        this.dynamic_price_factor = dynamic_price_factor;
        this.total_seats = total_seats;
        this.docType = 'transport';
    }
}

class Booking {
    constructor(booking_id, user_id, transport_id, seat_number, booking_date, journey_date, payment_status, booking_status) {
        this.booking_id = booking_id;
        this.user_id = user_id;
        this.transport_id = transport_id;
        this.seat_number = seat_number;
        this.booking_date = booking_date;
        this.journey_date = journey_date;
        this.payment_status = payment_status;
        this.booking_status = booking_status;
        this.docType = 'booking';
    }
}

class Seat {
    constructor(seat_id, transport_id, seat_number, is_booked) {
        this.seat_id = seat_id;
        this.transport_id = transport_id;
        this.seat_number = seat_number;
        this.is_booked = is_booked;
        this.docType = 'seat';
    }
}

class TicketBookingContract extends Contract {

    async initLedger(ctx) {
        console.info('Chaincode Instantiated');
    }

    _checkOrg(ctx, expectedMSP) {
        const mspId = ctx.clientIdentity.getMSPID();
        if (mspId !== expectedMSP) {
            throw new Error(`Only ${expectedMSP} members can perform this operation.`);
        }
    }

    _getInvokerId(ctx, contactEmail) {
        // return ctx.clientIdentity.getID();
        const normEmail = contactEmail.toLowerCase().trim();
        const providerId = crypto.createHash('sha256').update(normEmail).digest('hex');
        return providerId
    }

    // Functions for ServiceProvider (Org1)
    async registerProvider(ctx, companyName, contactEmail, contactPhone, hashed_password) {
        this._checkOrg(ctx, 'Org1MSP');
        const providerId = this._getInvokerId(ctx, contactEmail);
        const provider = new ServiceProvider(providerId, companyName, contactEmail, contactPhone, [], hashed_password);
        const providerKey = `PROVIDER_${providerId}`;
        await ctx.stub.putState(providerKey, Buffer.from(JSON.stringify(provider)));
        return JSON.stringify(provider);
    }

    async loginProvider(ctx, contactEmail) {
        this._checkOrg(ctx, 'Org1MSP');
        const providerId = crypto.createHash('sha256').update(contactEmail.toLowerCase().trim()).digest('hex');
        const providerKey = `PROVIDER_${providerId}`;
        const data = await ctx.stub.getState(providerKey);
        if (!data || data.length === 0) {
            throw new Error(`Provider not found for key: ${providerKey}`);
        }
        const provider = JSON.parse(data.toString());
        return provider.hashed_password;
    }

    async updateProvider(ctx, companyName, contactEmail, contactPhone) {
        this._checkOrg(ctx, 'Org1MSP');
        const providerId = this._getInvokerId(ctx);
        const providerKey = `PROVIDER_${providerId}`;
        const providerAsBytes = await ctx.stub.getState(providerKey);
        if (!providerAsBytes || providerAsBytes.length === 0) {
            throw new Error('Provider does not exist');
        }
        const provider = JSON.parse(providerAsBytes.toString());
        provider.company_name = companyName;
        provider.contact_email = contactEmail;
        provider.contact_phone = contactPhone;
        await ctx.stub.putState(providerKey, Buffer.from(JSON.stringify(provider)));
        return JSON.stringify(provider);
    }

    async deleteProvider(ctx) {
        this._checkOrg(ctx, 'Org1MSP');
        const providerId = this._getInvokerId(ctx);
        const providerKey = `PROVIDER_${providerId}`;
        await ctx.stub.deleteState(providerKey);
        return `Provider ${providerId} deleted`;
    }

    async addModeOfTransport(ctx, mode) {
        this._checkOrg(ctx, 'Org1MSP');
        const providerId = this._getInvokerId(ctx);
        const providerKey = `PROVIDER_${providerId}`;
        const providerAsBytes = await ctx.stub.getState(providerKey);
        if (!providerAsBytes || providerAsBytes.length === 0) {
            throw new Error('Provider does not exist');
        }
        const provider = JSON.parse(providerAsBytes.toString());
        provider.modes_of_transport.push(mode);
        await ctx.stub.putState(providerKey, Buffer.from(JSON.stringify(provider)));
        return JSON.stringify(provider);
    }

    async removeModeOfTransport(ctx, mode) {
        this._checkOrg(ctx, 'Org1MSP');
        const providerId = this._getInvokerId(ctx);
        const providerKey = `PROVIDER_${providerId}`;
        const providerAsBytes = await ctx.stub.getState(providerKey);
        if (!providerAsBytes || providerAsBytes.length === 0) {
            throw new Error('Provider does not exist');
        }
        const provider = JSON.parse(providerAsBytes.toString());
        provider.modes_of_transport = provider.modes_of_transport.filter(m => m !== mode);
        await ctx.stub.putState(providerKey, Buffer.from(JSON.stringify(provider)));
        return JSON.stringify(provider);
    }

    //7
    async addTransportOption(ctx, transportId, mode, source, destination, departure, arrival, price, seats) {
        this._checkOrg(ctx, 'Org1MSP');

        const providerId = this._getInvokerId(ctx);
        const dynamicFactor = this._calculateDynamicPriceFactor(seats);

        const transport = {
            transport_id: transportId,
            provider_id: providerId,
            mode_of_transport: mode,
            source: source,
            destination: destination,
            departure_time: departure,
            arrival_time: arrival,
            price: parseFloat(price),
            dynamic_price_factor: dynamicFactor,
            total_seats: parseInt(seats),
            docType: 'transport'
        };

        const transportKey = `TRANSPORT_${transportId}`;
        await ctx.stub.putState(transportKey, Buffer.from(JSON.stringify(transport)));
        return JSON.stringify(transport);
    }
    _calculateDynamicPriceFactor(seats) {
        const baseFactor = 1.0;
        if (seats >= 100) {
            return baseFactor;
        } else if (seats >= 50) {
            return baseFactor * 1.1;
        } else if (seats >= 20) {
            return baseFactor * 1.25;
        } else {
            return baseFactor * 1.5;
        }
    }

    //8
    async removeTransportOption(ctx, transportId) {
        this._checkOrg(ctx, 'Org1MSP');
        const transportKey = `TRANSPORT_${transportId}`;
        await ctx.stub.deleteState(transportKey);
        return `Transport ${transportId} deleted`;
    }

    //9
    async queryProviderTransportOptions(ctx, source, destination) {
        this._checkOrg(ctx, 'Org1MSP');
        const providerId = this._getInvokerId(ctx);

        const queryString = {
            selector: {
                docType: 'transport',
                provider_id: providerId,
                source: source,
                destination: destination
            }
        };

        const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];

        while (true) {
            const res = await resultsIterator.next();
            if (res.value && res.value.value.toString()) {
                allResults.push(JSON.parse(res.value.value.toString('utf8')));
            }
            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }

        return JSON.stringify(allResults);
    }

    // Functions for User (Org2)
    //1
    async registerUser(ctx, name, email, phoneNumber, isAnonymous) {
        this._checkOrg(ctx, 'Org2MSP');
        const userId = this._getInvokerId(ctx);
        const user = new User(userId, name, email, phoneNumber, isAnonymous === 'true');
        const userKey = `USER_${userId}`;
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        return JSON.stringify(user);
    }

    //3
    async updateUser(ctx, name, email, phoneNumber) {
        this._checkOrg(ctx, 'Org2MSP');
        const userId = this._getInvokerId(ctx);
        const userKey = `USER_${userId}`;
        const userAsBytes = await ctx.stub.getState(userKey);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error('User does not exist');
        }
        const user = JSON.parse(userAsBytes.toString());
        user.name = name;
        user.email = email;
        user.phone_number = phoneNumber;
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        return JSON.stringify(user);
    }

    //4
    async deleteUser(ctx) {
        this._checkOrg(ctx, 'Org2MSP');
        const userId = this._getInvokerId(ctx);
        const userKey = `USER_${userId}`;
        await ctx.stub.deleteState(userKey);
        return `User ${userId} deleted`;
    }

    //5
    async queryTransportOptions(ctx, source, destination) {
        const queryString = {
            selector: {
                docType: 'transport',
                source: source,
                destination: destination
            }
        };
        const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];
        while (true) {
            const res = await resultsIterator.next();
            if (res.value && res.value.value.toString()) {
                allResults.push(JSON.parse(res.value.value.toString('utf8')));
            }
            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }
        return JSON.stringify(allResults);
    }

    //6
    async bookTicket(ctx, transportId, seatNumber, bookingDate, journeyDate, amount, paymentMode) {
        this._checkOrg(ctx, 'Org2MSP');

        const userId = this._getInvokerId(ctx);
        const bookingId = await this._generateBookingId(ctx);

        // Simulate dummy payment
        const paymentStatus = await this._simulatePayment(amount, paymentMode);

        const bookingStatus = (paymentStatus === 'success') ? 'booked' : 'cancelled';

        const seatKey = `SEAT_${transportId}_${seatNumber}`;
        const seatAsBytes = await ctx.stub.getState(seatKey);
        if (seatAsBytes && JSON.parse(seatAsBytes.toString()).is_booked) {
            throw new Error('Seat already booked');
        }

        const booking = {
            booking_id: bookingId,
            user_id: userId,
            transport_id: transportId,
            seat_number: seatNumber,
            booking_date: bookingDate,
            journey_date: journeyDate,
            payment_status: paymentStatus,
            booking_status: bookingStatus,
            docType: 'booking'
        };

        const bookingKey = `BOOKING_${bookingId}`;
        await ctx.stub.putState(bookingKey, Buffer.from(JSON.stringify(booking)));

        const seat = { seat_id: `${transportId}_${seatNumber}`, transport_id: transportId, seat_number: seatNumber, is_booked: (bookingStatus === 'booked'), docType: 'seat' };
        await ctx.stub.putState(seatKey, Buffer.from(JSON.stringify(seat)));

        return JSON.stringify(booking);
    }
    //need to implement this in the backend.
    async _generateBookingId(ctx) {
        const timestamp = new Date().getTime();
        const randomString = crypto.randomBytes(3).toString('hex');
        return `BOOK_${timestamp}_${randomString}`;
    }
    async _simulatePayment(amount, paymentMode) {
        amount = parseFloat(amount);
        const normalizedMode = paymentMode.toLowerCase();

        // Better logic based on amount and payment mode
        if (normalizedMode === 'credit_card' || normalizedMode === 'upi') {
            if (amount <= 5000) {
                return 'success';
            } else {
                return (Math.random() < 0.9) ? 'success' : 'failure';
            }
        } else if (normalizedMode === 'debit_card') {
            if (amount <= 2000) {
                return 'success';
            } else {
                return (Math.random() < 0.8) ? 'success' : 'failure';
            }
        } else if (normalizedMode === 'net_banking') {
            return (Math.random() < 0.95) ? 'success' : 'failure';
        } else {
            // Unknown or unsupported payment modes fail more often
            return (Math.random() < 0.6) ? 'success' : 'failure';
        }
    }

    //7
    async cancelTicket(ctx, bookingId) {
        this._checkOrg(ctx, 'Org2MSP');
        const bookingKey = `BOOKING_${bookingId}`;
        const bookingAsBytes = await ctx.stub.getState(bookingKey);
        if (!bookingAsBytes || bookingAsBytes.length === 0) {
            throw new Error('Booking does not exist');
        }
        const booking = JSON.parse(bookingAsBytes.toString());
        booking.booking_status = 'cancelled';
        const seatKey = `SEAT_${booking.transport_id}_${booking.seat_number}`;
        const seat = new Seat(`${booking.transport_id}_${booking.seat_number}`, booking.transport_id, booking.seat_number, false);
        await ctx.stub.putState(seatKey, Buffer.from(JSON.stringify(seat)));
        await ctx.stub.putState(bookingKey, Buffer.from(JSON.stringify(booking)));
        return JSON.stringify(booking);
    }

    //8
    async changeTravelDate(ctx, bookingId, newJourneyDate) {
        this._checkOrg(ctx, 'Org2MSP');
        const bookingKey = `BOOKING_${bookingId}`;
        const bookingAsBytes = await ctx.stub.getState(bookingKey);
        if (!bookingAsBytes || bookingAsBytes.length === 0) {
            throw new Error('Booking does not exist');
        }
        const booking = JSON.parse(bookingAsBytes.toString());
        booking.journey_date = newJourneyDate;
        await ctx.stub.putState(bookingKey, Buffer.from(JSON.stringify(booking)));
        return JSON.stringify(booking);
    }

    //9
    async queryUserBookings(ctx) {
        this._checkOrg(ctx, 'Org2MSP');
        const userId = this._getInvokerId(ctx);
        const queryString = {
            selector: {
                docType: 'booking',
                user_id: userId
            }
        };
        const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];
        while (true) {
            const res = await resultsIterator.next();
            if (res.value && res.value.value.toString()) {
                allResults.push(JSON.parse(res.value.value.toString('utf8')));
            }
            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }
        return JSON.stringify(allResults);
    }
}

module.exports = TicketBookingContract;








// /*
//  * Copyright IBM Corp. All Rights Reserved.
//  *
//  * SPDX-License-Identifier: Apache-2.0
//  */

// 'use strict';

// // Deterministic JSON.stringify()
// const stringify  = require('json-stringify-deterministic');
// const sortKeysRecursive  = require('sort-keys-recursive');
// const { Contract } = require('fabric-contract-api');

// class AssetTransfer extends Contract {

//     async InitLedger(ctx) {
//         const assets = [
//             {
//                 ID: 'asset1',
//                 Color: 'blue',
//                 Size: 5,
//                 Owner: 'Tomoko',
//                 AppraisedValue: 300,
//             },
//             {
//                 ID: 'asset2',
//                 Color: 'red',
//                 Size: 5,
//                 Owner: 'Brad',
//                 AppraisedValue: 400,
//             },
//             {
//                 ID: 'asset3',
//                 Color: 'green',
//                 Size: 10,
//                 Owner: 'Jin Soo',
//                 AppraisedValue: 500,
//             },
//             {
//                 ID: 'asset4',
//                 Color: 'yellow',
//                 Size: 10,
//                 Owner: 'Max',
//                 AppraisedValue: 600,
//             },
//             {
//                 ID: 'asset5',
//                 Color: 'black',
//                 Size: 15,
//                 Owner: 'Adriana',
//                 AppraisedValue: 700,
//             },
//             {
//                 ID: 'asset6',
//                 Color: 'white',
//                 Size: 15,
//                 Owner: 'Michel',
//                 AppraisedValue: 800,
//             },
//         ];

//         for (const asset of assets) {
//             asset.docType = 'asset';
//             // example of how to write to world state deterministically
//             // use convetion of alphabetic order
//             // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
//             // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
//             await ctx.stub.putState(asset.ID, Buffer.from(stringify(sortKeysRecursive(asset))));
//         }
//     }

//     // CreateAsset issues a new asset to the world state with given details.
//     async CreateAsset(ctx, id, color, size, owner, appraisedValue) {
//         const exists = await this.AssetExists(ctx, id);
//         if (exists) {
//             throw new Error(`The asset ${id} already exists`);
//         }

//         const asset = {
//             ID: id,
//             Color: color,
//             Size: Number(size),
//             Owner: owner,
//             AppraisedValue: Number(appraisedValue),
//         };
//         // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
//         await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
//         return JSON.stringify(asset);
//     }

//     // ReadAsset returns the asset stored in the world state with given id.
//     async ReadAsset(ctx, id) {
//         const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
//         if (!assetJSON || assetJSON.length === 0) {
//             throw new Error(`The asset ${id} does not exist`);
//         }
//         return assetJSON.toString();
//     }

//     // UpdateAsset updates an existing asset in the world state with provided parameters.
//     async UpdateAsset(ctx, id, color, size, owner, appraisedValue) {
//         const exists = await this.AssetExists(ctx, id);
//         if (!exists) {
//             throw new Error(`The asset ${id} does not exist`);
//         }

//         // overwriting original asset with new asset
//         const updatedAsset = {
//             ID: id,
//             Color: color,
//             Size: size,
//             Owner: owner,
//             AppraisedValue: appraisedValue,
//         };
//         // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
//         return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
//     }

//     // DeleteAsset deletes an given asset from the world state.
//     async DeleteAsset(ctx, id) {
//         const exists = await this.AssetExists(ctx, id);
//         if (!exists) {
//             throw new Error(`The asset ${id} does not exist`);
//         }
//         return ctx.stub.deleteState(id);
//     }

//     // AssetExists returns true when asset with given ID exists in world state.
//     async AssetExists(ctx, id) {
//         const assetJSON = await ctx.stub.getState(id);
//         return assetJSON && assetJSON.length > 0;
//     }

//     // TransferAsset updates the owner field of asset with given id in the world state.
//     async TransferAsset(ctx, id, newOwner) {
//         const assetString = await this.ReadAsset(ctx, id);
//         const asset = JSON.parse(assetString);
//         const oldOwner = asset.Owner;
//         asset.Owner = newOwner;
//         // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
//         await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
//         return oldOwner;
//     }

//     // GetAllAssets returns all assets found in the world state.
//     async GetAllAssets(ctx) {
//         const allResults = [];
//         // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
//         const iterator = await ctx.stub.getStateByRange('', '');
//         let result = await iterator.next();
//         while (!result.done) {
//             const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
//             let record;
//             try {
//                 record = JSON.parse(strValue);
//             } catch (err) {
//                 console.log(err);
//                 record = strValue;
//             }
//             allResults.push(record);
//             result = await iterator.next();
//         }
//         return JSON.stringify(allResults);
//     }
// }

// module.exports = AssetTransfer;
