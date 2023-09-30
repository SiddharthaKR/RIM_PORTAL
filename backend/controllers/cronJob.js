const cron = require("node-cron");
const Item = require("../models/itemSchema");
const moment = require("moment");

const itemsCronJob = () => {
  // Choose default cron jobs for 1 minutes
  cron.schedule("* * * * *", async () => {
    const currentTimestamp = moment().valueOf();
    try {
      // Query for all items whose "endDate" field is less than the current date/time
      // and whose "occupiedTime" array contains at least one object whose "endTime"
      // field is less than the currentTimestamp
      const expiredItems = await Item.find({
        bookings: {
          $elemMatch: {
            outTime: { $lt: currentTimestamp },
          },
        },
      });

      // Update the status of each expired item
      await Promise.all(
        expiredItems.map(async (expiredItem) => {
          expiredItem.bookings = expiredItem.bookings.filter(request => request.outTime > currentTimestamp);
          // If there is no more occupiedTime, set the status to 'available'
          if (expiredItem.bookings.length === 0) {
            expiredItem.status = "available";
          } else {
            // Otherwise, find the next startTime and set the status to 'occupied' if it has been reached
            const nextStartTime = expiredItem.bookings[0].inTime;
            if (nextStartTime <= currentTimestamp) {
              expiredItem.status = "occupied";
            }
          }
          // Save the updated item
          await expiredItem.save();
          console.log(expiredItem)
        })
      );

      console.log(`Updated status for ${expiredItems.length} expired items`);
    } catch (error) {
      console.error("Error updating item statuses:", error);
    }
  });
};

module.exports = itemsCronJob;
