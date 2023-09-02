const { connectToRabbitMQForTest } = require('../consumer');

describe('RabitMQ connection', () => {
  it('Should connect to successfully RabbitMQ', async () => {
    const result = await connectToRabbitMQForTest();
    expect(result).toBeUndefined();
  });
});
