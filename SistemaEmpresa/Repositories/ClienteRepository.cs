using MySqlConnector;
using SistemaEmpresa.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace SistemaEmpresa.Repositories
{
    public class ClienteRepository
    {
        private readonly MySqlConnection _connection;

        public ClienteRepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<List<Cliente>> GetAll()
        {
            var clientes = new List<Cliente>();
            long currentProcessingId = 0; // Variável para ajudar a identificar o registro problemático
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT 
                        id, 
                        tipopessoa, 
                        nome, 
                        cpf, 
                        cnpj, 
                        razaosocial,
                        nomefantasia,
                        inscricaoestadual,
                        email,
                        telefone,
                        endereco,
                        numero,
                        complemento,
                        bairro,
                        cep,
                        cidade_id,
                        ativo
                    FROM cliente
                    ORDER BY nome", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                int idOrdinal = reader.GetOrdinal("id");
                int tipoPessoaOrdinal = reader.GetOrdinal("tipopessoa");
                int nomeOrdinal = reader.GetOrdinal("nome");
                int cpfOrdinal = reader.GetOrdinal("cpf");
                int cnpjOrdinal = reader.GetOrdinal("cnpj");
                int razaoSocialOrdinal = reader.GetOrdinal("razaosocial");
                int nomeFantasiaOrdinal = reader.GetOrdinal("nomefantasia");
                int inscricaoEstadualOrdinal = reader.GetOrdinal("inscricaoestadual");
                int emailOrdinal = reader.GetOrdinal("email");
                int telefoneOrdinal = reader.GetOrdinal("telefone");
                int enderecoOrdinal = reader.GetOrdinal("endereco");
                int numeroOrdinal = reader.GetOrdinal("numero");
                int complementoOrdinal = reader.GetOrdinal("complemento");
                int bairroOrdinal = reader.GetOrdinal("bairro");
                int cepOrdinal = reader.GetOrdinal("cep");
                int cidadeIdOrdinal = reader.GetOrdinal("cidade_id");
                int ativoOrdinal = reader.GetOrdinal("ativo");

                while (await reader.ReadAsync())
                {
                    var cliente = new Cliente();
                    try
                    {
                        currentProcessingId = reader.IsDBNull(idOrdinal) ? -1L : reader.GetInt64(idOrdinal);
                        cliente.Id = currentProcessingId;

                        cliente.TipoPessoa = reader.IsDBNull(tipoPessoaOrdinal) ? null : reader.GetString(tipoPessoaOrdinal);
                        cliente.Nome = reader.IsDBNull(nomeOrdinal) ? null : reader.GetString(nomeOrdinal);
                        cliente.CPF = reader.IsDBNull(cpfOrdinal) ? null : reader.GetString(cpfOrdinal);
                        cliente.CNPJ = reader.IsDBNull(cnpjOrdinal) ? null : reader.GetString(cnpjOrdinal);
                        cliente.RazaoSocial = reader.IsDBNull(razaoSocialOrdinal) ? null : reader.GetString(razaoSocialOrdinal);
                        cliente.NomeFantasia = reader.IsDBNull(nomeFantasiaOrdinal) ? null : reader.GetString(nomeFantasiaOrdinal);
                        cliente.InscricaoEstadual = reader.IsDBNull(inscricaoEstadualOrdinal) ? null : reader.GetString(inscricaoEstadualOrdinal);
                        cliente.Email = reader.IsDBNull(emailOrdinal) ? null : reader.GetString(emailOrdinal);
                        cliente.Telefone = reader.IsDBNull(telefoneOrdinal) ? null : reader.GetString(telefoneOrdinal);
                        cliente.Endereco = reader.IsDBNull(enderecoOrdinal) ? null : reader.GetString(enderecoOrdinal);
                        cliente.Numero = reader.IsDBNull(numeroOrdinal) ? null : reader.GetString(numeroOrdinal);
                        cliente.Complemento = reader.IsDBNull(complementoOrdinal) ? null : reader.GetString(complementoOrdinal);
                        cliente.Bairro = reader.IsDBNull(bairroOrdinal) ? null : reader.GetString(bairroOrdinal);
                        cliente.CEP = reader.IsDBNull(cepOrdinal) ? null : reader.GetString(cepOrdinal);
                          cliente.CidadeId = reader.IsDBNull(cidadeIdOrdinal) 
                            ? (long?)null 
                            : reader.GetInt64(cidadeIdOrdinal);
                        cliente.Ativo = !reader.IsDBNull(ativoOrdinal) && reader.GetBoolean(ativoOrdinal);
                        
                        clientes.Add(cliente);
                    }
                    catch (InvalidCastException ice)
                    {
                        Console.WriteLine($"[ClienteRepository.GetAll] ERRO DE CASTING ao processar cliente com ID (ou próximo a ID): {currentProcessingId}.");
                        Console.WriteLine($"[ClienteRepository.GetAll] Detalhes da Exceção: {ice.ToString()}");
                        throw; 
                    }
                }
            }
            catch(Exception ex)
            {
                Console.WriteLine($"[ClienteRepository.GetAll] ERRO GERAL: {ex.ToString()}");
                throw; 
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                {
                    await _connection.CloseAsync();
                }
            }
            return clientes;
        }

        public async Task<List<Cliente>> ReadByName(string nome)
        {
            var clientes = new List<Cliente>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT 
                        c.id, 
                        c.tipopessoa, 
                        c.nome, 
                        c.cpf, 
                        c.cnpj, 
                        c.razaosocial,
                        c.nomefantasia,
                        c.inscricaoestadual,
                        c.email,
                        c.telefone,
                        c.endereco,
                        c.numero,
                        c.complemento,
                        c.bairro,
                        c.cep,
                        c.cidade_id as cliente_cidade_id,  // ALTERAÇÃO AQUI - renomeando alias
                        c.ativo,
                        cid.id as cidade_id, 
                        cid.nome as cidade_nome, 
                        cid.codigo_ibge as cidade_codigo_ibge,
                        e.id as estado_id, 
                        e.nome as estado_nome, 
                        e.uf as estado_uf,
                        p.id as pais_id, 
                        p.nome as pais_nome, 
                        p.codigo as pais_codigo, 
                        p.sigla as pais_sigla
                    FROM cliente c
                    LEFT JOIN cidade cid ON c.cidade_id = cid.id
                    LEFT JOIN estado e ON cid.estado_id = e.id
                    LEFT JOIN pais p ON e.pais_id = p.id
                    WHERE c.nome LIKE @nome AND c.ativo = 1
                    ORDER BY c.nome", _connection);
                    
                command.Parameters.AddWithValue("@nome", $"%{nome}%");
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    clientes.Add(MapearCliente(reader));
                }
                
                return clientes;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<Cliente> Create(Cliente cliente)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    INSERT INTO cliente (
                        tipopessoa, nome, cpf, cnpj, razaosocial, nomefantasia,
                        inscricaoestadual, email, telefone, 
                        endereco, numero, complemento, bairro, cep, 
                        cidade_id, ativo
                    ) 
                    VALUES (
                        @tipoPessoa, @nome, @cpf, @cnpj, @razaoSocial, @nomeFantasia,
                        @inscricaoEstadual, @email, @telefone,
                        @endereco, @numero, @complemento, @bairro, @cep,
                        @cidadeId, @ativo
                    );
                    SELECT LAST_INSERT_ID();", _connection);
                
                // Preencher parâmetros sem o celular
                command.Parameters.AddWithValue("@tipoPessoa", cliente.TipoPessoa);
                command.Parameters.AddWithValue("@nome", cliente.Nome ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@cpf", cliente.CPF ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@cnpj", cliente.CNPJ ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@razaoSocial", cliente.RazaoSocial ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@nomeFantasia", cliente.NomeFantasia ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@inscricaoEstadual", cliente.InscricaoEstadual ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@email", cliente.Email ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@telefone", cliente.Telefone ?? (object)DBNull.Value);
                // Removi o parâmetro @celular
                command.Parameters.AddWithValue("@endereco", cliente.Endereco ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@numero", cliente.Numero ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@complemento", cliente.Complemento ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@bairro", cliente.Bairro ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@cep", cliente.CEP ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@cidadeId", cliente.CidadeId);
                command.Parameters.AddWithValue("@ativo", cliente.Ativo);
                
                var id = Convert.ToInt64(await command.ExecuteScalarAsync());
                cliente.Id = id;
                
                return cliente;
            }
            catch (Exception ex)
            {
                throw new Exception($"Erro ao criar cliente: {ex.Message}", ex);
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, Cliente cliente)
        {
            try
            {
                await _connection.OpenAsync();
                
                // Verifica se a cidade existe, se o cliente tiver cidade
                if (cliente.CidadeId.HasValue && cliente.CidadeId > 0)
                {
                    using var checkCommand = new MySqlCommand(
                        "SELECT COUNT(*) FROM cidade WHERE id = @cidadeId", 
                        _connection);
                    
                    checkCommand.Parameters.AddWithValue("@cidadeId", cliente.CidadeId);
                    var cidadeExists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync()) > 0;
                    
                    if (!cidadeExists)
                        throw new InvalidOperationException($"Cidade com ID {cliente.CidadeId} não encontrada");
                }
                
                using var command = new MySqlCommand(@"
                    UPDATE cliente
                    SET tipopessoa = @tipoPessoa, 
                        nome = @nome, 
                        cpf = @cpf, 
                        cnpj = @cnpj,
                        razaosocial = @razaoSocial,
                        nomefantasia = @nomeFantasia,
                        inscricaoestadual = @inscricaoEstadual,
                        email = @email, 
                        telefone = @telefone,
                        endereco = @endereco, 
                        numero = @numero, 
                        complemento = @complemento, 
                        bairro = @bairro, 
                        cep = @cep, 
                        cidade_id = @cidadeId, 
                        ativo = @ativo
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, cliente);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Delete(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                // Exclusão lógica (desativar)
                using var command = new MySqlCommand(
                    "UPDATE cliente SET ativo = 0 WHERE id = @id", _connection); // Esta query parece correta
                
                command.Parameters.AddWithValue("@id", id);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            catch (Exception ex) // Adicionar um log aqui pode ajudar
            {
                Console.WriteLine($"[ClienteRepository.Delete] ERRO ao excluir cliente ID {id}: {ex.ToString()}");
                throw; // Re-lança para ser tratado em camadas superiores
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> TemDependencias(long clienteId)
        {
            try
            {
                await _connection.OpenAsync();
                
                // Lista de tabelas a verificar
                var tabelas = new List<string> {
                    "venda", "compra", "pedido", "orcamento",
                    // Adicione outras tabelas conforme necessário
                };
                
                foreach (var tabela in tabelas)
                {
                    try {
                        string sql = $"SELECT COUNT(*) FROM {tabela} WHERE cliente_id = @clienteId LIMIT 1";
                        using var command = new MySqlCommand(sql, _connection);
                        command.Parameters.AddWithValue("@clienteId", clienteId);
                        
                        var count = Convert.ToInt32(await command.ExecuteScalarAsync());
                        if (count > 0) {
                            return true;
                        }
                    }
                    catch (Exception ex) {
                        Console.WriteLine($"Erro ao verificar tabela {tabela}: {ex.Message}");
                    }
                }
                
                return false;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        private void PreencherParametros(MySqlCommand command, Cliente cliente)
        {
            command.Parameters.AddWithValue("@tipoPessoa", cliente.TipoPessoa);
            command.Parameters.AddWithValue("@nome", cliente.Nome ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@cpf", cliente.CPF ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@cnpj", cliente.CNPJ ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@razaoSocial", cliente.RazaoSocial ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@nomeFantasia", cliente.NomeFantasia ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@inscricaoEstadual", cliente.InscricaoEstadual ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@email", cliente.Email ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@telefone", cliente.Telefone ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@endereco", cliente.Endereco ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@numero", cliente.Numero ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@complemento", cliente.Complemento ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@bairro", cliente.Bairro ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@cep", cliente.CEP ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@cidadeId", cliente.CidadeId.HasValue ? cliente.CidadeId : DBNull.Value);
            command.Parameters.AddWithValue("@ativo", cliente.Ativo);
        }

        public async Task<Cliente> ReadById(long id) // Ou Task<Cliente?> dependendo da sua necessidade
        {
            try
            {
                await _connection.OpenAsync();
                // Certifique-se que esta query NÃO contém comentários C# como '//'
                using var command = new MySqlCommand(@"
                    SELECT 
                        c.id, 
                        c.tipopessoa, 
                        c.nome, 
                        c.cpf, 
                        c.cnpj, 
                        c.razaosocial,
                        c.nomefantasia,
                        c.inscricaoestadual,
                        c.email,
                        c.telefone,
                        c.endereco,
                        c.numero,
                        c.complemento,
                        c.bairro,
                        c.cep,
                        c.cidade_id as cliente_cidade_id, -- Comentário SQL é com '--' ou '/*' '*/', não '//'
                        c.ativo,
                        cid.id as cidade_id_da_tabela_cidade,  -- Renomeie para evitar ambiguidade se necessário
                        cid.nome as cidade_nome, 
                        cid.codigo_ibge as cidade_codigo_ibge,
                        e.id as estado_id, 
                        e.nome as estado_nome, 
                        e.uf as estado_uf,
                        p.id as pais_id, 
                        p.nome as pais_nome, 
                        p.codigo as pais_codigo, 
                        p.sigla as pais_sigla
                    FROM cliente c
                    LEFT JOIN cidade cid ON c.cidade_id = cid.id
                    LEFT JOIN estado e ON cid.estado_id = e.id
                    LEFT JOIN pais p ON e.pais_id = p.id
                    WHERE c.id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    return MapearCliente(reader); 
                }
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClienteRepository.ReadById] ERRO ao buscar cliente ID {id}: {ex.ToString()}");
                throw;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<List<Cliente>> GetAllAsync() // Ou o nome que você usa para buscar todos os clientes
        {
            var clientes = new List<Cliente>();
            try
            {
                await _connection.OpenAsync();
                using var command = new MySqlCommand(@"
                    SELECT 
                        c.id, 
                        c.tipopessoa, 
                        c.nome, 
                        c.cpf, 
                        c.cnpj, 
                        c.razaosocial,
                        c.nomefantasia,
                        c.inscricaoestadual,
                        c.email,
                        c.telefone,
                        c.endereco,
                        c.numero,
                        c.complemento,
                        c.bairro,
                        c.cep,
                        c.cidade_id as cliente_cidade_id, 
                        c.ativo,
                        cid.id as cidade_id_da_tabela_cidade, 
                        cid.nome as cidade_nome, 
                        cid.codigo_ibge as cidade_codigo_ibge,
                        e.id as estado_id, 
                        e.nome as estado_nome, 
                        e.uf as estado_uf,
                        p.id as pais_id, 
                        p.nome as pais_nome, 
                        p.codigo as pais_codigo, 
                        p.sigla as pais_sigla
                    FROM cliente c
                    LEFT JOIN cidade cid ON c.cidade_id = cid.id
                    LEFT JOIN estado e ON cid.estado_id = e.id
                    LEFT JOIN pais p ON e.pais_id = p.id
                    ORDER BY c.nome ASC, c.razaosocial ASC; -- ADICIONADO ORDER BY AQUI
                ", _connection);

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    // Reutiliza o MapearCliente que você já tem e que está preparado para aninhar Cidade, Estado, País
                    clientes.Add(MapearCliente(reader)); 
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClienteRepository.GetAllAsync] ERRO ao buscar todos os clientes: {ex.ToString()}");
                // Considere relançar a exceção ou tratar de forma apropriada
                throw; 
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            return clientes;
        }

        // Seu método MapearCliente existente (verifique se ele está como o da interação anterior,
        // que já mapeia cliente.Cidade.Nome, cliente.Cidade.Estado.UF etc.)
        private Cliente MapearCliente(MySqlDataReader reader)
        {
            var cliente = new Cliente
            {
                Id = reader.GetInt64(reader.GetOrdinal("id")),
                TipoPessoa = reader.IsDBNull(reader.GetOrdinal("tipopessoa")) ? null : reader.GetString(reader.GetOrdinal("tipopessoa")),
                Nome = reader.IsDBNull(reader.GetOrdinal("nome")) ? null : reader.GetString(reader.GetOrdinal("nome")),
                CPF = reader.IsDBNull(reader.GetOrdinal("cpf")) ? null : reader.GetString(reader.GetOrdinal("cpf")),
                CNPJ = reader.IsDBNull(reader.GetOrdinal("cnpj")) ? null : reader.GetString(reader.GetOrdinal("cnpj")),
                RazaoSocial = reader.IsDBNull(reader.GetOrdinal("razaosocial")) ? null : reader.GetString(reader.GetOrdinal("razaosocial")),
                NomeFantasia = reader.IsDBNull(reader.GetOrdinal("nomefantasia")) ? null : reader.GetString(reader.GetOrdinal("nomefantasia")),
                InscricaoEstadual = reader.IsDBNull(reader.GetOrdinal("inscricaoestadual")) ? null : reader.GetString(reader.GetOrdinal("inscricaoestadual")),
                Email = reader.IsDBNull(reader.GetOrdinal("email")) ? null : reader.GetString(reader.GetOrdinal("email")),
                Telefone = reader.IsDBNull(reader.GetOrdinal("telefone")) ? null : reader.GetString(reader.GetOrdinal("telefone")),
                Endereco = reader.IsDBNull(reader.GetOrdinal("endereco")) ? null : reader.GetString(reader.GetOrdinal("endereco")),
                Numero = reader.IsDBNull(reader.GetOrdinal("numero")) ? null : reader.GetString(reader.GetOrdinal("numero")),
                Complemento = reader.IsDBNull(reader.GetOrdinal("complemento")) ? null : reader.GetString(reader.GetOrdinal("complemento")),
                Bairro = reader.IsDBNull(reader.GetOrdinal("bairro")) ? null : reader.GetString(reader.GetOrdinal("bairro")),
                CEP = reader.IsDBNull(reader.GetOrdinal("cep")) ? null : reader.GetString(reader.GetOrdinal("cep")),
                CidadeId = reader.IsDBNull(reader.GetOrdinal("cliente_cidade_id")) 
                    ? (int?)null 
                    : reader.GetInt64(reader.GetOrdinal("cliente_cidade_id")),
                Ativo = !reader.IsDBNull(reader.GetOrdinal("ativo")) && reader.GetBoolean(reader.GetOrdinal("ativo"))
            };

            if (!reader.IsDBNull(reader.GetOrdinal("cidade_id_da_tabela_cidade")))
            {
                cliente.Cidade = new Cidade
                {
                    Id = reader.GetInt64(reader.GetOrdinal("cidade_id_da_tabela_cidade")), // Se Cidade.Id for int, precisará de conversão aqui também
                    Nome = reader.IsDBNull(reader.GetOrdinal("cidade_nome")) ? null : reader.GetString(reader.GetOrdinal("cidade_nome")),
                    CodigoIBGE = reader.IsDBNull(reader.GetOrdinal("cidade_codigo_ibge")) ? null : reader.GetString(reader.GetOrdinal("cidade_codigo_ibge")),
                };

                if (!reader.IsDBNull(reader.GetOrdinal("estado_id")))
                {
                    cliente.Cidade.Estado = new Estado
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("estado_id")), // Já está como GetInt32, o que é bom se Estado.Id for int
                        Nome = reader.IsDBNull(reader.GetOrdinal("estado_nome")) ? null : reader.GetString(reader.GetOrdinal("estado_nome")),
                        UF = reader.IsDBNull(reader.GetOrdinal("estado_uf")) ? null : reader.GetString(reader.GetOrdinal("estado_uf")),
                    };

                    if (!reader.IsDBNull(reader.GetOrdinal("pais_id")))
                    {
                        cliente.Cidade.Estado.Pais = new Pais
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("pais_id")), // Já está como GetInt32, o que é bom se Pais.Id for int
                            Nome = reader.IsDBNull(reader.GetOrdinal("pais_nome")) ? null : reader.GetString(reader.GetOrdinal("pais_nome")),
                            Codigo = reader.IsDBNull(reader.GetOrdinal("pais_codigo")) ? null : reader.GetString(reader.GetOrdinal("pais_codigo")),
                            Sigla = reader.IsDBNull(reader.GetOrdinal("pais_sigla")) ? null : reader.GetString(reader.GetOrdinal("pais_sigla")),
                        };
                    }
                }
            }
            return cliente;
        }
    }
}
