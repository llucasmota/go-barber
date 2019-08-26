module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'users', // informando tabela a ser alterada
      'avatar_id',
      {
        /**
         * model é o nome da tabela
         * key é a coluna de referencia
         */
        type: Sequelize.INTEGER,
        references: { model: 'files', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      }
    );
  },

  down: queryInterface => {
    /**
     * Caso seja utilizado o down, na tabela usuários, será removido o atributo avatar_id
     */
    return queryInterface.removeColumn('users', 'avatar_id');
  },
};
