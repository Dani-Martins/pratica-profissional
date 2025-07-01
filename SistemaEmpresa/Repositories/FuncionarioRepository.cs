using MySqlConnector;
using SistemaEmpresa.Models;
using SistemaEmpresa.Extensions;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace SistemaEmpresa.Repositories
{
    public class FuncionarioRepository
    {
        private readonly MySqlConnection _connection;

        public FuncionarioRepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<List<Funcionario>> ReadAll(bool incluirInativos = false)
        {
            var funcionarios = new List<Funcionario>();
            
            try
            {
                await _connection.OpenAsync();
                
                // Consulta completa com todos os campos necessários
                string sql = @"
                    SELECT 
                        f.*,
                        cid.id as cidade_id,
                        cid.nome as cidade_nome,
                        cid.codigo_ibge as cidade_codigo_ibge,
                        e.id as estado_id,
                        e.nome as estado_nome,
                        e.uf as estado_uf,
                        p.id as pais_id,
                        p.nome as pais_nome,
                        p.codigo as pais_codigo,
                        p.sigla as pais_sigla,
                        ff.id as funcao_id,
                        ff.funcaofuncionario as funcao_nome,
                        ff.situacao as funcao_situacao
                    FROM 
                        funcionario f
                    LEFT JOIN 
                        cidade cid ON f.cidade_id = cid.id
                    LEFT JOIN 
                        estado e ON cid.estado_id = e.id
                    LEFT JOIN 
                        pais p ON e.pais_id = p.id
                    LEFT JOIN 
                        funcaofuncionarios ff ON f.funcaofuncionarioid = ff.id";
                
                if (!incluirInativos)
                {
                    sql += " WHERE f.ativo = 1";
                }
                
                sql += " ORDER BY f.nome";
                
                Console.WriteLine($"SQL: {sql}");
                
                using var command = new MySqlCommand(sql, _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    try
                    {
                        var funcionario = MapearFuncionario(reader);
                        funcionarios.Add(funcionario);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Erro ao mapear funcionário: {ex.Message}");
                        Console.WriteLine($"StackTrace: {ex.StackTrace}");
                        // Continua para o próximo registro, em vez de falhar toda a consulta
                    }
                }
                
                return funcionarios;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro no ReadAll de funcionários: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                throw;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<Funcionario?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT f.*, 
                           cid.id as cidade_id, cid.nome as cidade_nome, cid.codigo_ibge as cidade_codigo_ibge,
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf,
                           p.id as pais_id, p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla,
                           ff.id as funcao_id, ff.funcaofuncionario as funcao_nome, ff.situacao as funcao_situacao
                    FROM funcionario f
                    LEFT JOIN cidade cid ON f.cidade_id = cid.id
                    LEFT JOIN estado e ON cid.estado_id = e.id
                    LEFT JOIN pais p ON e.pais_id = p.id
                    LEFT JOIN funcaofuncionarios ff ON f.funcaofuncionarioid = ff.id
                    WHERE f.id = @id", _connection);
                    
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearFuncionario(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<List<Funcionario>> ReadByName(string nome)
        {
            var funcionarios = new List<Funcionario>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT f.*, 
                           cid.id as cidade_id, cid.nome as cidade_nome, cid.codigo_ibge as cidade_codigo_ibge,
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf,
                           p.id as pais_id, p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla,
                           ff.id as funcao_id, ff.funcaofuncionario as funcao_nome, ff.situacao as funcao_situacao
                    FROM funcionario f
                    LEFT JOIN cidade cid ON f.cidade_id = cid.id
                    LEFT JOIN estado e ON cid.estado_id = e.id
                    LEFT JOIN pais p ON e.pais_id = p.id
                    LEFT JOIN funcaofuncionarios ff ON f.funcaofuncionarioid = ff.id
                    WHERE f.nome LIKE @nome
                    ORDER BY f.nome", _connection);
                    
                command.Parameters.AddWithValue("@nome", $"%{nome}%");
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    funcionarios.Add(MapearFuncionario(reader));
                }
                
                return funcionarios;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }        public async Task<bool> Create(Funcionario funcionario)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    INSERT INTO funcionario (
                        tipopessoa, nome, cpf, rg, data_nascimento, telefone, 
                        email, endereco, numero, complemento, bairro, 
                        cep, cidade_id, salario, data_admissao, 
                        data_demissao, ativo, apelido, cnh, datavalidadecnh,
                        sexo, observacoes, estadocivil, isbrasileiro, nacionalidade,
                        funcaofuncionarioid, datacriacao, usercriacao
                    )
                    VALUES (
                        'F', @nome, @cpf, @rg, @dataNascimento, @telefone, 
                        @email, @endereco, @numero, @complemento, @bairro, 
                        @cep, @cidadeId, @salario, @dataAdmissao, 
                        @dataDemissao, @ativo, @apelido, @cnh, @dataValidadeCNH,
                        @sexo, @observacoes, @estadoCivil, @isBrasileiro, @nacionalidade,
                        @funcaoFuncionarioId, @dataCriacao, @userCriacao
                    );
                    SELECT LAST_INSERT_ID();", _connection);
        
        // Parâmetros para o comando SQL
        command.Parameters.AddWithValue("@nome", funcionario.Nome);
        command.Parameters.AddWithValue("@cpf", funcionario.CPF ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@rg", funcionario.RG ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@dataNascimento", funcionario.DataNascimento.HasValue ? funcionario.DataNascimento : DBNull.Value);
        command.Parameters.AddWithValue("@telefone", funcionario.Telefone ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@email", funcionario.Email ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@endereco", funcionario.Endereco ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@numero", funcionario.Numero ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@complemento", funcionario.Complemento ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@bairro", funcionario.Bairro ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@cep", funcionario.CEP ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@cidadeId", funcionario.CidadeId.HasValue ? funcionario.CidadeId : DBNull.Value);
        command.Parameters.AddWithValue("@salario", funcionario.Salario.HasValue ? funcionario.Salario : DBNull.Value);
        command.Parameters.AddWithValue("@dataAdmissao", funcionario.DataAdmissao.HasValue ? funcionario.DataAdmissao : DBNull.Value);
        command.Parameters.AddWithValue("@dataDemissao", funcionario.DataDemissao.HasValue ? funcionario.DataDemissao : DBNull.Value);
        command.Parameters.AddWithValue("@ativo", funcionario.Ativo);
        
        // Novos parâmetros
        command.Parameters.AddWithValue("@apelido", funcionario.Apelido ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@cnh", funcionario.CNH ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@dataValidadeCNH", funcionario.DataValidadeCNH.HasValue ? funcionario.DataValidadeCNH : DBNull.Value);
        command.Parameters.AddWithValue("@sexo", funcionario.Sexo.HasValue ? funcionario.Sexo : DBNull.Value);
        command.Parameters.AddWithValue("@estadoCivil", funcionario.EstadoCivil.HasValue ? funcionario.EstadoCivil : DBNull.Value);
        command.Parameters.AddWithValue("@isBrasileiro", funcionario.IsBrasileiro);
        command.Parameters.AddWithValue("@nacionalidade", funcionario.Nacionalidade.HasValue ? funcionario.Nacionalidade : DBNull.Value);
        command.Parameters.AddWithValue("@observacoes", funcionario.Observacoes ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@funcaoFuncionarioId", funcionario.FuncaoFuncionarioId.HasValue ? funcionario.FuncaoFuncionarioId : DBNull.Value);
        
        // Campos de controle
        command.Parameters.AddWithValue("@dataCriacao", funcionario.DataCriacao);
        command.Parameters.AddWithValue("@userCriacao", funcionario.UserCriacao ?? "SISTEMA");
        
        var id = Convert.ToInt64(await command.ExecuteScalarAsync());
        funcionario.Id = id;
        
        return id > 0;
    }
    finally
    {
        if (_connection.State == ConnectionState.Open)
            await _connection.CloseAsync();
    }
}        public async Task<bool> Update(long id, Funcionario funcionario)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    UPDATE funcionario
                    SET tipopessoa = 'F',
                        nome = @nome, 
                        cpf = @cpf, 
                        rg = @rg, 
                        data_nascimento = @dataNascimento, 
                        telefone = @telefone, 
                        email = @email, 
                        endereco = @endereco, 
                        numero = @numero, 
                        complemento = @complemento, 
                        bairro = @bairro, 
                        cep = @cep, 
                        cidade_id = @cidadeId, 
                        salario = @salario, 
                        data_admissao = @dataAdmissao, 
                        data_demissao = @dataDemissao,
                        apelido = @apelido,
                        cnh = @cnh,
                        datavalidadecnh = @dataValidadeCNH,
                        sexo = @sexo,
                        observacoes = @observacoes,
                        estadocivil = @estadoCivil,
                        isbrasileiro = @isBrasileiro,
                        nacionalidade = @nacionalidade,
                        funcaofuncionarioid = @funcaoFuncionarioId,
                        dataalteracao = @dataAlteracao,
                        useratualizacao = @userAtualizacao,
                        ativo = @ativo
                    WHERE id = @id", _connection);
        
        command.Parameters.AddWithValue("@id", id);
        
        // Parâmetros para os campos
        command.Parameters.AddWithValue("@nome", funcionario.Nome);
        command.Parameters.AddWithValue("@cpf", funcionario.CPF ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@rg", funcionario.RG ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@dataNascimento", funcionario.DataNascimento.HasValue ? funcionario.DataNascimento : DBNull.Value);
        command.Parameters.AddWithValue("@telefone", funcionario.Telefone ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@email", funcionario.Email ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@endereco", funcionario.Endereco ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@numero", funcionario.Numero ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@complemento", funcionario.Complemento ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@bairro", funcionario.Bairro ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@cep", funcionario.CEP ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@cidadeId", funcionario.CidadeId.HasValue ? funcionario.CidadeId : DBNull.Value);
        command.Parameters.AddWithValue("@salario", funcionario.Salario.HasValue ? funcionario.Salario : DBNull.Value);
        command.Parameters.AddWithValue("@dataAdmissao", funcionario.DataAdmissao.HasValue ? funcionario.DataAdmissao : DBNull.Value);
        command.Parameters.AddWithValue("@dataDemissao", funcionario.DataDemissao.HasValue ? funcionario.DataDemissao : DBNull.Value);
        command.Parameters.AddWithValue("@ativo", funcionario.Ativo);
        
        // Novos parâmetros
        command.Parameters.AddWithValue("@apelido", funcionario.Apelido ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@cnh", funcionario.CNH ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@dataValidadeCNH", funcionario.DataValidadeCNH.HasValue ? funcionario.DataValidadeCNH : DBNull.Value);
        command.Parameters.AddWithValue("@sexo", funcionario.Sexo.HasValue ? funcionario.Sexo : DBNull.Value);
        command.Parameters.AddWithValue("@estadoCivil", funcionario.EstadoCivil.HasValue ? funcionario.EstadoCivil : DBNull.Value);
        command.Parameters.AddWithValue("@isBrasileiro", funcionario.IsBrasileiro);
        command.Parameters.AddWithValue("@nacionalidade", funcionario.Nacionalidade.HasValue ? funcionario.Nacionalidade : DBNull.Value);
        command.Parameters.AddWithValue("@observacoes", funcionario.Observacoes ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@funcaoFuncionarioId", funcionario.FuncaoFuncionarioId.HasValue ? funcionario.FuncaoFuncionarioId : DBNull.Value);
        
        // Campos de controle para atualização
        command.Parameters.AddWithValue("@dataAlteracao", DateTime.Now);
        command.Parameters.AddWithValue("@userAtualizacao", funcionario.UserAtualizacao ?? "SISTEMA");
        
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
                
                using var command = new MySqlCommand(
                    "UPDATE funcionario SET ativo = 0 WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }        private Funcionario MapearFuncionario(MySqlDataReader reader)
        {
            try
            {
                var funcionario = new Funcionario
                {
                    Id = reader.GetInt64("id"),
                    
                    // Campos de pessoa física
                    Nome = reader.IsDBNull(reader.GetOrdinal("nome")) ? string.Empty : reader.GetString("nome"),
                    CPF = reader.IsDBNull(reader.GetOrdinal("cpf")) ? null : reader.GetString("cpf"),
                    RG = reader.IsDBNull(reader.GetOrdinal("rg")) ? null : reader.GetString("rg"),
                    
                    // Verificar se os campos existem antes de tentar acessá-los
                    Apelido = TemColuna(reader, "apelido") && !reader.IsDBNull(reader.GetOrdinal("apelido")) ? reader.GetString("apelido") : null,
                    CNH = TemColuna(reader, "cnh") && !reader.IsDBNull(reader.GetOrdinal("cnh")) ? reader.GetString("cnh") : null,
                    DataValidadeCNH = TemColuna(reader, "datavalidadecnh") && !reader.IsDBNull(reader.GetOrdinal("datavalidadecnh")) ? (DateTime?)reader.GetDateTime("datavalidadecnh") : null,
                    Sexo = TemColuna(reader, "sexo") && !reader.IsDBNull(reader.GetOrdinal("sexo")) ? (int?)reader.GetInt32("sexo") : null,
                    EstadoCivil = TemColuna(reader, "estadocivil") && !reader.IsDBNull(reader.GetOrdinal("estadocivil")) ? (int?)reader.GetInt32("estadocivil") : null,
                    IsBrasileiro = TemColuna(reader, "isbrasileiro") && !reader.IsDBNull(reader.GetOrdinal("isbrasileiro")) ? reader.GetInt32("isbrasileiro") : 1,
                    Nacionalidade = TemColuna(reader, "nacionalidade") && !reader.IsDBNull(reader.GetOrdinal("nacionalidade")) ? (int?)reader.GetInt32("nacionalidade") : null,
                    Observacoes = TemColuna(reader, "observacoes") && !reader.IsDBNull(reader.GetOrdinal("observacoes")) ? reader.GetString("observacoes") : null,
                    
                    DataNascimento = reader.IsDBNull(reader.GetOrdinal("data_nascimento")) ? (DateTime?)null : reader.GetDateTime("data_nascimento"),
                    Telefone = reader.IsDBNull(reader.GetOrdinal("telefone")) ? null : reader.GetString("telefone"),
                    Email = reader.IsDBNull(reader.GetOrdinal("email")) ? null : reader.GetString("email"),
                    Endereco = reader.IsDBNull(reader.GetOrdinal("endereco")) ? null : reader.GetString("endereco"),
                    Numero = reader.IsDBNull(reader.GetOrdinal("numero")) ? null : reader.GetString("numero"),
                    Complemento = reader.IsDBNull(reader.GetOrdinal("complemento")) ? null : reader.GetString("complemento"),
                    Bairro = reader.IsDBNull(reader.GetOrdinal("bairro")) ? null : reader.GetString("bairro"),
                    CEP = reader.IsDBNull(reader.GetOrdinal("cep")) ? null : reader.GetString("cep"),
                    CidadeId = reader.IsDBNull(reader.GetOrdinal("cidade_id")) ? (long?)null : reader.GetInt64("cidade_id"),
                    FuncaoFuncionarioId = TemColuna(reader, "funcaofuncionarioid") && !reader.IsDBNull(reader.GetOrdinal("funcaofuncionarioid")) ? (int?)reader.GetInt32("funcaofuncionarioid") : null,
                    DataAdmissao = reader.IsDBNull(reader.GetOrdinal("data_admissao")) ? (DateTime?)null : reader.GetDateTime("data_admissao"),
                    DataDemissao = reader.IsDBNull(reader.GetOrdinal("data_demissao")) ? (DateTime?)null : reader.GetDateTime("data_demissao"),
                    Ativo = reader.IsDBNull(reader.GetOrdinal("ativo")) ? false : reader.GetBoolean("ativo"),
                    Salario = reader.IsDBNull(reader.GetOrdinal("salario")) ? (decimal?)null : reader.GetDecimal("salario"),
                    
                    // Campos de controle - com verificação se existem
                    DataCriacao = TemColuna(reader, "datacriacao") && !reader.IsDBNull(reader.GetOrdinal("datacriacao")) ? reader.GetDateTime("datacriacao") : DateTime.Now,
                    DataAlteracao = TemColuna(reader, "dataalteracao") && !reader.IsDBNull(reader.GetOrdinal("dataalteracao")) ? (DateTime?)reader.GetDateTime("dataalteracao") : null,
                    UserCriacao = TemColuna(reader, "usercriacao") && !reader.IsDBNull(reader.GetOrdinal("usercriacao")) ? reader.GetString("usercriacao") : "SISTEMA",
                    UserAtualizacao = TemColuna(reader, "useratualizacao") && !reader.IsDBNull(reader.GetOrdinal("useratualizacao")) ? reader.GetString("useratualizacao") : null
                };

                // Se tiver cidade, cria o objeto
                try
                {
                    if (!reader.IsDBNull(reader.GetOrdinal("cidade_id")))
                    {
                        var cidade = new Cidade
                        {
                            Id = reader.GetInt64("cidade_id"),
                            Nome = reader.IsDBNull(reader.GetOrdinal("cidade_nome")) ? string.Empty : reader.GetString("cidade_nome"),
                            CodigoIBGE = TemColuna(reader, "cidade_codigo_ibge") && !reader.IsDBNull(reader.GetOrdinal("cidade_codigo_ibge")) ? reader.GetString("cidade_codigo_ibge") : null,
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
                                    Codigo = TemColuna(reader, "pais_codigo") && !reader.IsDBNull(reader.GetOrdinal("pais_codigo")) ? reader.GetString("pais_codigo") : string.Empty,
                                    Sigla = TemColuna(reader, "pais_sigla") && !reader.IsDBNull(reader.GetOrdinal("pais_sigla")) ? reader.GetString("pais_sigla") : string.Empty
                                };
                            }
                            
                            cidade.Estado = estado;
                        }
                        
                        funcionario.Cidade = cidade;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao mapear Cidade/Estado/País: {ex.Message}");
                }

                // Se tiver função de funcionário, cria o objeto
                try
                {
                    if (TemColuna(reader, "funcao_id") && !reader.IsDBNull(reader.GetOrdinal("funcao_id")))
                    {
                        funcionario.FuncaoFuncionario = new FuncaoFuncionario
                        {
                            Id = reader.GetInt32("funcao_id"),
                            FuncaoFuncionarioNome = reader.IsDBNull(reader.GetOrdinal("funcao_nome")) ? string.Empty : reader.GetString("funcao_nome"),
                            Situacao = TemColuna(reader, "funcao_situacao") && !reader.IsDBNull(reader.GetOrdinal("funcao_situacao")) ? reader.GetString("funcao_situacao") : string.Empty
                        };
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao mapear FuncaoFuncionario: {ex.Message}");
                }

                return funcionario;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao mapear funcionário: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                throw new Exception($"Erro ao mapear funcionário: {ex.Message}", ex);
            }
        }

        // Método auxiliar para verificar se uma coluna existe no DataReader
        private bool TemColuna(MySqlDataReader reader, string columnName)
        {
            try
            {
                reader.GetOrdinal(columnName);
                return true;
            }
            catch (IndexOutOfRangeException)
            {
                return false;
            }
        }
    }
}
