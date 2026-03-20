const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

// Tentar diferentes connection strings
const connectionStrings = [
  process.env.DATABASE_URL,
  'postgresql://localhost/mitra_db',
  'postgresql:///mitra_db',
];

const users = [
  {
    nome: 'Luiza Tutora',
    email: 'luiza.tutora@teste.com',
    senha: 'JCHh14025520',
    tipoUsuario: 'TUTOR',
    telefone: '11999999001',
  },
  {
    nome: 'Luiza Prestadora',
    email: 'luiza.prestadora@teste.com',
    senha: 'JCHh14025520',
    tipoUsuario: 'PRESTADOR',
    telefone: '11999999002',
  },
  {
    nome: 'Luiza Visitante',
    email: 'luiza.visitante@teste.com',
    senha: 'JCHh14025520',
    tipoUsuario: 'TUTOR',
    telefone: '11999999003',
  },
];

async function tryConnectionString(connStr, index) {
  console.log(`\n🔌 Tentativa ${index + 1}: ${connStr?.substring(0, 50)}...`);

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: connStr,
        },
      },
    });

    console.log('✅ Conexão estabelecida!');
    return prisma;
  } catch (error) {
    console.log(`❌ Falha: ${error.message?.substring(0, 100)}`);
    return null;
  }
}

async function main() {
  console.log('🌱 Buscando conexão ao banco de dados...');

  let prisma = null;

  for (let i = 0; i < connectionStrings.length; i++) {
    if (connectionStrings[i]) {
      prisma = await tryConnectionString(connectionStrings[i], i);
      if (prisma) break;
    }
  }

  if (!prisma) {
    console.error('❌ Não conseguiu conectar ao banco de dados com nenhuma string de conexão');
    console.log('\nDica: Verifique se:');
    console.log('  1. PostgreSQL está rodando (lsof -i :5432)');
    console.log('  2. O banco "mitra_db" existe');
    console.log('  3. As credenciais estão corretas no .env');
    process.exit(1);
  }

  console.log('\n🌱 Iniciando seed de usuários...\n');

  for (const user of users) {
    try {
      // Check if user already exists
      const exists = await prisma.usuario.findUnique({
        where: { email: user.email },
      });

      if (exists) {
        console.log(`⚠️  ${user.email} já existe no banco de dados`);
        continue;
      }

      // Hash password
      const senhaHash = await argon2.hash(user.senha);

      // Create user
      const newUser = await prisma.usuario.create({
        data: {
          nome: user.nome,
          email: user.email,
          senhaHash,
          telefone: user.telefone,
          tipoUsuario: user.tipoUsuario,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          tipoUsuario: true,
          criadoEm: true,
        },
      });

      console.log(`✅ ${user.tipoUsuario}: ${user.email}`);
      console.log(`   └─ ID: ${newUser.id}`);
      console.log(`   └─ Nome: ${newUser.nome}`);
      console.log(`   └─ Tipo: ${newUser.tipoUsuario}`);
      console.log(`   └─ Criado em: ${newUser.criadoEm.toLocaleString('pt-BR')}\n`);

      // If is prestador, create professional profile
      if (user.tipoUsuario === 'PRESTADOR') {
        const perfilPrestador = await prisma.perfilPrestador.create({
          data: {
            usuarioId: newUser.id,
            tipoPrestador: 'VETERINARIO',
            nomeEmpresa: 'Clínica Veterinária Luiza',
            telefoneProfissional: user.telefone,
            endereco: 'Rua das Flores, 123, São Paulo, SP',
            descricao: 'Clínica veterinária especializada em animais pequenos',
          },
        });
        console.log(`   🏥 Perfil Profissional criado (ID: ${perfilPrestador.id})\n`);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar ${user.email}:`);
      console.error(`   ${error.message?.substring(0, 150)}\n`);
    }
  }

  console.log('✨ Seed concluído!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Erro fatal:', e.message);
  process.exit(1);
});
