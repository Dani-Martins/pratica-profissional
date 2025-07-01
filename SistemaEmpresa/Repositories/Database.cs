using MySqlConnector;

namespace SistemaEmpresa.Repositories 
{
    public class Database
    {
        private readonly string _connectionString = "Server=localhost;Database=sistema_empresa;User=root;Password=dsm852003;AllowUserVariables=True";

        public MySqlConnection Conectar()
        {
            var conexao = new MySqlConnection(_connectionString);
            conexao.Open();
            return conexao;
        }
    }
}
