const { initDatabase } = require('./database');

const initDb = async () => {
  console.log('🔄 Inicializando banco de dados...');
  await initDatabase();
  console.log('✅ Inicialização concluída!');
};

// Se executado diretamente
if (require.main === module) {
  initDb();
}

module.exports = { initDb };