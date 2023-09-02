const amqp = require('amqplib');

const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    if (!connection) throw new Error('Connection not established!');

    const channel = await connection.createChannel();
    return { connection, channel };
  } catch (error) {
    throw error;
  }
};

const connectToRabbitMQForTest = async () => {
  try {
    const { connection, channel } = await connectToRabbitMQ();

    const queueName = 'test-queue';
    const msg = 'Testing';
    await channel.assertQueue(queueName);
    channel.sendToQueue(queueName, Buffer.from(msg));

    await connection.close();
  } catch (error) {
    throw error;
  }
};

const consumerQueue = async (queueName) => {
  try {
    console.log(queueName); // Debugging line
    const { channel } = await connectToRabbitMQ();
    await channel.assertQueue(queueName, {
      durable: true,
    });
    console.log('Waiting for messages...');
    channel.consume(
      queueName,
      (msg) => {
        console.log(
          `Received message: ${msg.content.toString()} from queue: ${queueName}`
        );
      },
      {
        noAck: true,
      }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Case normal
const consumerQueueNormal = async (queueName) => {
  try {
    const { channel, connection } = await connectToRabbitMQ();
    const notifyQueueName = 'notificationQueue';

    // const timeExpire = 12000;
    // setTimeout(() => {
    //   channel.consume(notifyQueueName, (msg) => {
    //     console.log(
    //       `[Normal] Received notification:::: ${msg.content.toString()} from queue:::: ${notifyQueueName}`
    //     );
    //     channel.ack(msg);
    //   });
    // }, timeExpire)

    channel.consume(notifyQueueName, (msg) => {
      try {
        const numberTest = Math.random();
        if (numberTest < 0.8) {
          throw new Error('Test error');
        }
        console.log(
          `[Normal] Received notification:::: ${msg.content.toString()} from queue:::: ${notifyQueueName}`
        );
        channel.ack(msg);
      } catch (error) {
        console.log('Error::: ', error);
        channel.nack(msg, false, false);
        /**
         * nack: negative acknowledgement
         * Doi so 2: Message co nen duoc sap xep lai hay khong
         *    If false thi khong day vao hang doi ban dau ma se day vao hang doi bi loi
         * Doi so 3: Muon tu choi nhieu thu hay khong
         *    If false thi chi tu choi Message hien tai
         */
      }
    });
  } catch (error) {
    throw error;
  }
};

// Case failure
const consumerQueueFailure = async (queueName) => {
  try {
    const { channel, connection } = await connectToRabbitMQ();
    const notifyExchangeNameDLX = 'notificationExDLX';
    const notifyRoutingKeyDLX = 'notificationRoutingKeyDLX';
    const notifyQueueHotFixName = 'notificationHotFix';

    // 1. Crete Exchange
    // Direct: Chuyen tin nhan den routing key khop chinh xac nhat
    await channel.assertExchange(notifyExchangeNameDLX, 'direct', {
      durable: true,
    });

    // 2. Create queue
    const queueResul = await channel.assertQueue(notifyQueueHotFixName, {
      exclusive: false, // Cho phep cac ket noi truy cap vao cung mot hang doi
    });

    await channel.bindQueue(
      queueResul.queue,
      notifyExchangeNameDLX,
      notifyRoutingKeyDLX
    );

    await channel.consume(
      queueName.queue,
      (msg) => {
        console.log(`This is Message Error::: ${msg.content.toString()}`);
      },
      { noAck: true }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  connectToRabbitMQForTest,
  connectToRabbitMQ,
  consumerQueue,
  consumerQueueNormal,
  consumerQueueFailure,
};
