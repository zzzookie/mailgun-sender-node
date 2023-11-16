/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Campaings', [
      {
        name: 'registration_without_activation',
        mg_template: '2023.09_registration_without_activation',
      },
      {
        name: 'test_campaing_name',
        mg_template: '2023.09_random_campaing_name',
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
