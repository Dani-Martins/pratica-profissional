using MySqlConnector;
using SistemaEmpresa.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace SistemaEmpresa.Repositories
{
    public class FornecedorRepository
    {
        private readonly MySqlConnection _connection;

        public FornecedorRepository(MySqlConnection connection)
        {
            _connection = connection;
        }        public async Task<List<Fornecedor>> ReadAll()
        {
            var fornecedores = new List<Fornecedor>();
            
            try
            {
                await _connection.OpenAsync();
                  Console.WriteLine("Executando query de ReadAll para fornecedores");                using var command = new MySqlCommand(@"
                    SELECT f.*, 
                           cid.id as cidade_id, cid.nome as cidade_nome, cid.codigo_ibge as cidade_codigo_ibge,
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf,
                           p.id as pais_id, p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla
                    FROM fornecedores f
                    LEFT JOIN cidade cid ON f.cidade_id = cid.id
                    LEFT JOIN estado e ON cid.estado_id = e.id
                    LEFT JOIN pais p ON e.pais_id = p.id
                    ORDER BY f.razao_social", _connection);
                    
                Console.WriteLine("Executando reader para fornecedores");
                using var reader = await command.ExecuteReaderAsync();
                
                int contadorFornecedores = 0;
                while (await reader.ReadAsync())
                {
                    try
                    {
                        var fornecedor = MapearFornecedor(reader);
                        fornecedores.Add(fornecedor);
                        contadorFornecedores++;
                        
                        Console.WriteLine($"Fornecedor {contadorFornecedores} mapeado: ID={fornecedor.Id}, TipoPessoa={fornecedor.TipoPessoa}, RazaoSocial={fornecedor.RazaoSocial}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Erro ao mapear fornecedor individual: {ex.Message}");
                        Console.WriteLine($"StackTrace: {ex.StackTrace}");
                        // Continue para o próximo registro mesmo se houver erro
                    }
                }
                
                Console.WriteLine($"Total de {contadorFornecedores} fornecedores mapeados com sucesso");
                return fornecedores;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro no ReadAll de fornecedores: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                // Re-throw para ser tratado na camada superior
                throw;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<Fornecedor?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT f.*, 
                           cid.id as cidade_id, cid.nome as cidade_nome, cid.codigo_ibge as cidade_codigo_ibge,
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf,
                           p.id as pais_id, p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla
                    FROM fornecedores f
                    LEFT JOIN cidade cid ON f.cidade_id = cid.id
                    LEFT JOIN estado e ON cid.estado_id = e.id
                    LEFT JOIN pais p ON e.pais_id = p.id
                    WHERE f.id = @id", _connection);
                    
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearFornecedor(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<List<Fornecedor>> ReadByRazaoSocial(string razaoSocial)
        {
            var fornecedores = new List<Fornecedor>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT f.*, 
                           cid.id as cidade_id, cid.nome as cidade_nome, cid.codigo_ibge as cidade_codigo_ibge,
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf,
                           p.id as pais_id, p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla                    FROM fornecedores f
                    LEFT JOIN cidade cid ON f.cidade_id = cid.id
                    LEFT JOIN estado e ON cid.estado_id = e.id
                    LEFT JOIN pais p ON e.pais_id = p.id
                    WHERE f.razao_social LIKE @razaoSocial
                    ORDER BY f.razao_social", _connection);
                    
                command.Parameters.AddWithValue("@razaoSocial", $"%{razaoSocial}%");
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    fornecedores.Add(MapearFornecedor(reader));
                }
                
                return fornecedores;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<Fornecedor?> ReadByCNPJ(string cnpj)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT f.*, 
                           cid.id as cidade_id, cid.nome as cidade_nome, cid.codigo_ibge as cidade_codigo_ibge,
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf,
                           p.id as pais_id, p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla                    FROM fornecedores f
                    LEFT JOIN cidade cid ON f.cidade_id = cid.id
                    LEFT JOIN estado e ON cid.estado_id = e.id
                    LEFT JOIN pais p ON e.pais_id = p.id
                    WHERE f.cnpj = @cnpj", _connection);
                    
                command.Parameters.AddWithValue("@cnpj", cnpj);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearFornecedor(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Create(Fornecedor fornecedor)
        {
            try
            {
                await _connection.OpenAsync();
                  using var command = new MySqlCommand(@"                    INSERT INTO fornecedores (
                        tipopessoa, nome, cpf, razao_social, nome_fantasia, cnpj, inscricao_estadual, email, telefone, 
                        endereco, numero, complemento, bairro, cep, 
                        cidade_id, ativo, apelido, limitecredito, rg,
                        contato, condicaopagamentoid, observacao, datacriacao, dataalteracao,
                        usercriacao, useratualizacao
                    )
                    VALUES (
                        @tipoPessoa, @nome, @cpf, @razaoSocial, @nomeFantasia, @cnpj, @inscricaoEstadual, @email, @telefone, 
                        @endereco, @numero, @complemento, @bairro, @cep, 
                        @cidadeId, @ativo, @apelido, @limiteCredito, @rg,
                        @contato, @condicaoPagamentoId, @observacao, @dataCriacao, @dataAlteracao,
                        @userCriacao, @userAtualizacao
                    );
                    SELECT LAST_INSERT_ID();", _connection);
                
                PreencherParametros(command, fornecedor);
                
                var id = Convert.ToInt64(await command.ExecuteScalarAsync());
                fornecedor.Id = id;
                
                return id > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, Fornecedor fornecedor)
        {
            try
            {
                await _connection.OpenAsync();
                  using var command = new MySqlCommand(@"
                    UPDATE fornecedores
                    SET tipopessoa = @tipoPessoa,
                        nome = @nome,
                        cpf = @cpf,                        razao_social = @razaoSocial, 
                        nome_fantasia = @nomeFantasia,                        cnpj = @cnpj, 
                        inscricao_estadual = @inscricaoEstadual,
                        email = @email,
                        telefone = @telefone, 
                        endereco = @endereco, 
                        numero = @numero, 
                        complemento = @complemento, 
                        bairro = @bairro, 
                        cep = @cep, 
                        cidade_id = @cidadeId, 
                        ativo = @ativo,
                        apelido = @apelido,
                        limitecredito = @limiteCredito,
                        rg = @rg,
                        contato = @contato,
                        condicaopagamentoid = @condicaoPagamentoId,
                        observacao = @observacao,
                        dataalteracao = @dataAlteracao,
                        useratualizacao = @userAtualizacao
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, fornecedor);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }        public async Task<bool> Delete(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                // Exclusão lógica (desativar o fornecedor)
                Console.WriteLine($"[FornecedorRepository.Delete] Inativando fornecedor ID {id}");
                using var command = new MySqlCommand(
                    "UPDATE fornecedores SET ativo = 0 WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                int affectedRows = await command.ExecuteNonQueryAsync();
                Console.WriteLine($"[FornecedorRepository.Delete] Fornecedor ID {id} inativado com sucesso. Registros afetados: {affectedRows}");
                
                return affectedRows > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FornecedorRepository.Delete] ERRO ao inativar fornecedor ID {id}: {ex.Message}");
                Console.WriteLine($"[FornecedorRepository.Delete] StackTrace: {ex.StackTrace}");
                throw; // Re-lança para ser tratado em camadas superiores
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<IEnumerable<Fornecedor>> ReadByName(string nome)
        {
            // Reuse existing method since it already implements the same functionality
            return await ReadByRazaoSocial(nome);
        }        private void PreencherParametros(MySqlCommand command, Fornecedor fornecedor)
        {
            command.Parameters.AddWithValue("@tipoPessoa", fornecedor.TipoPessoa);
            command.Parameters.AddWithValue("@nome", fornecedor.Nome ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@cpf", fornecedor.CPF ?? (object)DBNull.Value);            command.Parameters.AddWithValue("@razaoSocial", fornecedor.RazaoSocial);
            command.Parameters.AddWithValue("@nomeFantasia", fornecedor.NomeFantasia ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@cnpj", fornecedor.CNPJ ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@inscricaoEstadual", fornecedor.InscricaoEstadual ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@email", fornecedor.Email ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@telefone", fornecedor.Telefone ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@endereco", fornecedor.Endereco ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@numero", fornecedor.Numero ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@complemento", fornecedor.Complemento ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@bairro", fornecedor.Bairro ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@cep", fornecedor.CEP ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@cidadeId", fornecedor.CidadeId.HasValue ? fornecedor.CidadeId : DBNull.Value);
            command.Parameters.AddWithValue("@ativo", fornecedor.Ativo);
            
            // Novos campos
            command.Parameters.AddWithValue("@apelido", fornecedor.Apelido ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@limiteCredito", fornecedor.LimiteCredito.HasValue ? fornecedor.LimiteCredito : (object)DBNull.Value);
            command.Parameters.AddWithValue("@rg", fornecedor.RG ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@contato", fornecedor.Contato ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@condicaoPagamentoId", fornecedor.CondicaoPagamentoId.HasValue ? fornecedor.CondicaoPagamentoId : (object)DBNull.Value);
            command.Parameters.AddWithValue("@observacao", fornecedor.Observacao ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@dataCriacao", fornecedor.DataCriacao.HasValue ? fornecedor.DataCriacao : DateTime.Now);
            command.Parameters.AddWithValue("@dataAlteracao", DateTime.Now);
            command.Parameters.AddWithValue("@userCriacao", fornecedor.UserCriacao ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@userAtualizacao", fornecedor.UserAtualizacao ?? (object)DBNull.Value);
        }        private Fornecedor MapearFornecedor(MySqlDataReader reader)
        {
            try
            {
                var fornecedor = new Fornecedor
                {
                    Id = reader.GetInt64("id"),
                    TipoPessoa = reader.IsDBNull(reader.GetOrdinal("tipopessoa")) ? "J" : reader.GetString("tipopessoa"),
                    Nome = reader.IsDBNull(reader.GetOrdinal("nome")) ? null : reader.GetString("nome"),
                    CPF = reader.IsDBNull(reader.GetOrdinal("cpf")) ? null : reader.GetString("cpf"),
                    RazaoSocial = reader.GetString("razao_social"),
                    NomeFantasia = reader.IsDBNull(reader.GetOrdinal("nome_fantasia")) ? null : reader.GetString("nome_fantasia"),
                    CNPJ = reader.IsDBNull(reader.GetOrdinal("cnpj")) ? null : reader.GetString("cnpj"),
                    Email = reader.IsDBNull(reader.GetOrdinal("email")) ? null : reader.GetString("email"),
                    Telefone = reader.IsDBNull(reader.GetOrdinal("telefone")) ? null : reader.GetString("telefone"),
                    Endereco = reader.IsDBNull(reader.GetOrdinal("endereco")) ? null : reader.GetString("endereco"),
                    Numero = reader.IsDBNull(reader.GetOrdinal("numero")) ? null : reader.GetString("numero"),
                    Complemento = reader.IsDBNull(reader.GetOrdinal("complemento")) ? null : reader.GetString("complemento"),
                    Bairro = reader.IsDBNull(reader.GetOrdinal("bairro")) ? null : reader.GetString("bairro"),
                    CEP = reader.IsDBNull(reader.GetOrdinal("cep")) ? null : reader.GetString("cep"),
                    CidadeId = reader.IsDBNull(reader.GetOrdinal("cidade_id")) ? (long?)null : reader.GetInt64("cidade_id"),
                    Ativo = reader.GetBoolean("ativo"),
                    
                    // Novos campos
                    Apelido = reader.IsDBNull(reader.GetOrdinal("apelido")) ? null : reader.GetString("apelido"),
                    LimiteCredito = reader.IsDBNull(reader.GetOrdinal("limitecredito")) ? null : reader.GetDecimal("limitecredito"),
                    RG = reader.IsDBNull(reader.GetOrdinal("rg")) ? null : reader.GetString("rg"),
                    Contato = reader.IsDBNull(reader.GetOrdinal("contato")) ? null : reader.GetString("contato"),
                    CondicaoPagamentoId = reader.IsDBNull(reader.GetOrdinal("condicaopagamentoid")) ? (long?)null : reader.GetInt64("condicaopagamentoid"),
                    Observacao = reader.IsDBNull(reader.GetOrdinal("observacao")) ? null : reader.GetString("observacao"),
                    DataCriacao = reader.IsDBNull(reader.GetOrdinal("datacriacao")) ? null : reader.GetDateTime("datacriacao"),
                    DataAlteracao = reader.IsDBNull(reader.GetOrdinal("dataalteracao")) ? null : reader.GetDateTime("dataalteracao"),
                    UserCriacao = reader.IsDBNull(reader.GetOrdinal("usercriacao")) ? null : reader.GetString("usercriacao"),
                    UserAtualizacao = reader.IsDBNull(reader.GetOrdinal("useratualizacao")) ? null : reader.GetString("useratualizacao")                };                // Verificar se o campo inscricao_estadual existe
                try
                {
                    int inscricaoEstadualOrdinal = reader.GetOrdinal("inscricao_estadual");
                    fornecedor.InscricaoEstadual = reader.IsDBNull(inscricaoEstadualOrdinal) ? null : reader.GetString("inscricao_estadual");
                    Console.WriteLine($"Inscrição Estadual obtida com sucesso para o fornecedor {fornecedor.Id}: {fornecedor.InscricaoEstadual}");
                }
                catch (IndexOutOfRangeException ex)
                {
                    Console.WriteLine($"Coluna 'inscricao_estadual' não encontrada: {ex.Message}. Tentando alternativas...");
                    // Tentar alternativas (compatibilidade)
                    try {
                        int inscricaoEstadualOrdinal = reader.GetOrdinal("inscricaoestadual");
                        fornecedor.InscricaoEstadual = reader.IsDBNull(inscricaoEstadualOrdinal) ? null : reader.GetString("inscricaoestadual");
                        Console.WriteLine($"Inscrição Estadual obtida de 'inscricaoestadual' para o fornecedor {fornecedor.Id}: {fornecedor.InscricaoEstadual}");
                    }
                    catch (IndexOutOfRangeException ex2)
                    {
                        Console.WriteLine($"Coluna 'inscricaoestadual' também não encontrada: {ex2.Message}. Tentando mais uma alternativa...");
                        
                        try {
                            int inscricaoEstadualOrdinal = reader.GetOrdinal("inscricaoEstadual");
                            fornecedor.InscricaoEstadual = reader.IsDBNull(inscricaoEstadualOrdinal) ? null : reader.GetString("inscricaoEstadual");
                            Console.WriteLine($"Inscrição Estadual obtida de 'inscricaoEstadual' para o fornecedor {fornecedor.Id}: {fornecedor.InscricaoEstadual}");
                        }
                        catch (IndexOutOfRangeException)
                        {
                            // Campo não existe em nenhuma forma, definir um valor padrão
                            fornecedor.InscricaoEstadual = fornecedor.TipoPessoa == "F" ? "ISENTO" : null;
                            Console.WriteLine($"Nenhum campo de inscrição estadual encontrado na tabela. Definido valor padrão para fornecedor {fornecedor.Id}: {fornecedor.InscricaoEstadual}");
                        }
                    }
                }

                // Se tiver cidade, cria o objeto
                if (!reader.IsDBNull(reader.GetOrdinal("cidade_id")))
                {
                    var cidade = new Cidade
                    {
                        Id = reader.GetInt64("cidade_id"),
                        Nome = reader.IsDBNull(reader.GetOrdinal("cidade_nome")) ? string.Empty : reader.GetString("cidade_nome"),
                        CodigoIBGE = reader.IsDBNull(reader.GetOrdinal("cidade_codigo_ibge")) ? null : reader.GetString("cidade_codigo_ibge"),
                    };

                    // Verifica se tem estado antes de acessar
                    if (!reader.IsDBNull(reader.GetOrdinal("estado_id")))
                    {
                        cidade.EstadoId = reader.GetInt64("estado_id");
                        
                        var estado = new Estado
                        {
                            Id = reader.GetInt64("estado_id"),
                            Nome = reader.IsDBNull(reader.GetOrdinal("estado_nome")) ? string.Empty : reader.GetString("estado_nome"),
                            UF = reader.IsDBNull(reader.GetOrdinal("estado_uf")) ? string.Empty : reader.GetString("estado_uf"),
                        };

                        // Verifica se tem país antes de acessar
                        if (!reader.IsDBNull(reader.GetOrdinal("pais_id")))
                        {
                            estado.PaisId = reader.GetInt64("pais_id");
                            
                            estado.Pais = new Pais
                            {
                                Id = reader.GetInt64("pais_id"),
                                Nome = reader.IsDBNull(reader.GetOrdinal("pais_nome")) ? string.Empty : reader.GetString("pais_nome"),
                                Codigo = reader.IsDBNull(reader.GetOrdinal("pais_codigo")) ? string.Empty : reader.GetString("pais_codigo"),
                                Sigla = reader.IsDBNull(reader.GetOrdinal("pais_sigla")) ? string.Empty : reader.GetString("pais_sigla")
                            };
                        }
                        
                        cidade.Estado = estado;
                    }
                    
                    fornecedor.Cidade = cidade;
                }

                return fornecedor;
            } 
            catch (Exception ex) 
            {
                Console.WriteLine($"Erro ao mapear fornecedor: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                throw;
            }
        }
    }
}
