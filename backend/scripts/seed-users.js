const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

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
    tipoUsuario: 'TUTOR', // Visitante também é tutor de contato
    telefone: '11999999003',
  },
];

async function main() {
  console.log('🌱 Iniciando seed de usuários...');

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

      console.log(`✅ ${user.tipoUsuario}: ${user.email} criado com sucesso!`);
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Nome: ${newUser.nome}`);
      console.log(`   Tipo: ${newUser.tipoUsuario}`);
      console.log(`   Criado em: ${newUser.criadoEm}\n`);

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
        console.log(`   🏥 Perfil Profissional criado: ${perfilPrestador.id}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar ${user.email}:`, error.message);
    }
  }

  console.log('\n✨ Seed completo!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Erro fatal:', e);
  process.exit(1);
});
