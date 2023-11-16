/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Translations', [
      {
        camp_id: 1,
        lang: 'en',
        from: 'Admin Name',
        subject: 'Please finish your registration',
      },
      {
        camp_id: 1,
        lang: 'es',
        from: 'Muchacho Adminio',
        subject: 'Finalice su registro por favor',
      },
      {
        camp_id: 2,
        lang: 'en',
        from: 'Test Admin Name',
        subject: 'Test subjest',
      },
      {
        camp_id: 2,
        lang: 'es',
        from: 'Nombre del administrador',
        subject: 'Sujeto de prueba',
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
