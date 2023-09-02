const { connectToRabbitMQ } = require('./consumer');

const runProducer = async () => {
  try {
    const { connection, channel } = await connectToRabbitMQ();

    const notifyExchangeName = 'notificationEx';
    const notifyQueueName = 'notificationQueue';
    const notifyExchangeNameDLX = 'notificationExDLX';
    const notifyRoutingKeyDLX = 'notificationRoutingKeyDLX';

    // 1. Crete Exchange
    // Direct: Chuyen tin nhan den routing key khop chinh xac nhat
    await channel.assertExchange(notifyExchangeName, 'direct', {
      durable: true,
    });

    // 2. Create queue
    const queueResul = await channel.assertQueue(notifyQueueName, {
      exclusive: false, // Cho phep cac ket noi truy cap vao cung mot hang doi
      deadLetterExchange: notifyExchangeNameDLX,
      deadLetterRoutingKey: notifyRoutingKeyDLX,
    });

    console.log('queueResult:::: ', queueResul);

    // 3. Binding queue
    // Dinh tuyen exchange den queue
    await channel.bindQueue(queueResul.queue, notifyExchangeName);

    // 4. Send message
    const msg = 'New notification';
    console.log(`Send notification:::: ${msg}`);

    channel.sendToQueue(queueResul.queue, Buffer.from(msg), {
      expiration: '10000',
    });

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};

runProducer();
