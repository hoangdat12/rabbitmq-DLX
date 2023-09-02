const {
  consumerQueue,
  consumerQueueNormal,
  consumerQueueFailure,
} = require('./src/consumer');

const queueName = 'test-topic';
// consumerQueue(queueName)
//   .then(() => {
//     console.log(`Message consumer started ${queueName}`);
//   })
//   .catch((error) => {
//     console.log(`Error::: ${error}`);
//   });

consumerQueueNormal(queueName)
  .then(() => {
    console.log(`Message consumer Normal started`);
  })
  .catch((error) => {});

consumerQueueFailure(queueName)
  .then(() => {
    console.log(`Message consumer started Failure`);
  })
  .catch((error) => {});
