const { connectToRabbitMQ } = require('./consumer');

const runProducer = async () => {
  try {
    const { connection, channel } = await connectToRabbitMQ();
    const queueName = 'test-topic';
    await channel.assertQueue(queueName, {
      durable: true,
    });
    channel.sendToQueue(
      queueName,
      Buffer.from('From Producer: Hello Consumer')
    );

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};

runProducer();
