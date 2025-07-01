using MySqlConnector;
using SistemaEmpresa.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace SistemaEmpresa.Repositories
{
    public class FuncaoFuncionarioRepository
    {
        private readonly MySqlConnection _connection;

        public FuncaoFuncionarioRepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<List<FuncaoFuncionario>> ReadAll()
        {
            var funcoes = new List<FuncaoFuncionario>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    @"SELECT * FROM funcaofuncionarios ORDER BY funcaofuncionario", _connection);
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    funcoes.Add(MapearFuncaoFuncionario(reader));
                }
                
                return funcoes;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro no ReadAll de funções de funcionários: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                throw;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<FuncaoFuncionario?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    @"SELECT * FROM funcaofuncionarios WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearFuncaoFuncionario(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<List<FuncaoFuncionario>> ReadBySituacao(string situacao)
        {
            var funcoes = new List<FuncaoFuncionario>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    @"SELECT * FROM funcaofuncionarios WHERE situacao = @situacao ORDER BY funcaofuncionario", _connection);
                
                command.Parameters.AddWithValue("@situacao", situacao);
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    funcoes.Add(MapearFuncaoFuncionario(reader));
                }
                
                return funcoes;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<List<FuncaoFuncionario>> ReadByNome(string nome)
        {
            var funcoes = new List<FuncaoFuncionario>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    @"SELECT * FROM funcaofuncionarios WHERE funcaofuncionario LIKE @nome ORDER BY funcaofuncionario", _connection);
                
                command.Parameters.AddWithValue("@nome", $"%{nome}%");
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    funcoes.Add(MapearFuncaoFuncionario(reader));
                }
                
                return funcoes;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Create(FuncaoFuncionario funcaoFuncionario)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    @"INSERT INTO funcaofuncionarios (
                        funcaofuncionario, requercnh, tipocnhrequerido, cargahoraria, descricao, observacao, 
                        situacao, datacriacao, dataalteracao, usercriacao, useratualizacao
                     )
                     VALUES (
                        @funcaoFuncionarioNome, @requerCNH, @tipoCNHRequerido, @cargaHoraria, @descricao, @observacao, 
                        @situacao, @dataCriacao, @dataAlteracao, @userCriacao, @userAtualizacao
                     );
                     SELECT LAST_INSERT_ID();", _connection);
                
                PreencherParametros(command, funcaoFuncionario);
                
                var id = Convert.ToInt64(await command.ExecuteScalarAsync());
                funcaoFuncionario.Id = id;
                
                return id > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, FuncaoFuncionario funcaoFuncionario)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    @"UPDATE funcaofuncionarios
                     SET 
                        funcaofuncionario = @funcaoFuncionarioNome,
                        requercnh = @requerCNH,
                        tipocnhrequerido = @tipoCNHRequerido,
                        cargahoraria = @cargaHoraria,
                        descricao = @descricao,
                        observacao = @observacao,
                        situacao = @situacao,
                        dataalteracao = @dataAlteracao,
                        useratualizacao = @userAtualizacao
                     WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, funcaoFuncionario);
                
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
                
                // Exclusão lógica (inativar)
                Console.WriteLine($"[FuncaoFuncionarioRepository.Delete] Inativando função ID {id}");
                using var command = new MySqlCommand(
                    @"UPDATE funcaofuncionarios 
                     SET situacao = 'I',
                         dataalteracao = @dataAlteracao,
                         useratualizacao = @userAtualizacao
                     WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                command.Parameters.AddWithValue("@dataAlteracao", DateTime.Now);
                command.Parameters.AddWithValue("@userAtualizacao", "Sistema");
                
                int affectedRows = await command.ExecuteNonQueryAsync();
                Console.WriteLine($"[FuncaoFuncionarioRepository.Delete] Função ID {id} inativada com sucesso. Registros afetados: {affectedRows}");
                
                return affectedRows > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FuncaoFuncionarioRepository.Delete] ERRO ao inativar função ID {id}: {ex.Message}");
                Console.WriteLine($"[FuncaoFuncionarioRepository.Delete] StackTrace: {ex.StackTrace}");
                throw;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        private FuncaoFuncionario MapearFuncaoFuncionario(MySqlDataReader reader)
        {
            try
            {
                var funcao = new FuncaoFuncionario
                {
                    Id = reader.GetInt64("id"),
                    FuncaoFuncionarioNome = reader.GetString("funcaofuncionario"),
                    RequerCNH = reader.GetBoolean("requercnh"),
                    TipoCNHRequerido = reader.IsDBNull(reader.GetOrdinal("tipocnhrequerido")) ? null : reader.GetString("tipocnhrequerido"),
                    CargaHoraria = reader.GetDecimal("cargahoraria"),
                    Descricao = reader.IsDBNull(reader.GetOrdinal("descricao")) ? null : reader.GetString("descricao"),
                    Observacao = reader.IsDBNull(reader.GetOrdinal("observacao")) ? null : reader.GetString("observacao"),
                    Situacao = reader.GetString("situacao"),
                    DataCriacao = reader.IsDBNull(reader.GetOrdinal("datacriacao")) ? DateTime.MinValue : reader.GetDateTime("datacriacao"),
                    DataAlteracao = reader.IsDBNull(reader.GetOrdinal("dataalteracao")) ? null : reader.GetDateTime("dataalteracao"),
                    UserCriacao = reader.IsDBNull(reader.GetOrdinal("usercriacao")) ? null : reader.GetString("usercriacao"),
                    UserAtualizacao = reader.IsDBNull(reader.GetOrdinal("useratualizacao")) ? null : reader.GetString("useratualizacao")
                };

                return funcao;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao mapear função de funcionário: {ex.Message}");
                throw;
            }
        }

        private void PreencherParametros(MySqlCommand command, FuncaoFuncionario funcaoFuncionario)
        {
            command.Parameters.AddWithValue("@funcaoFuncionarioNome", funcaoFuncionario.FuncaoFuncionarioNome);
            command.Parameters.AddWithValue("@requerCNH", funcaoFuncionario.RequerCNH);
            command.Parameters.AddWithValue("@tipoCNHRequerido", funcaoFuncionario.TipoCNHRequerido ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@cargaHoraria", funcaoFuncionario.CargaHoraria);
            command.Parameters.AddWithValue("@descricao", funcaoFuncionario.Descricao ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@observacao", funcaoFuncionario.Observacao ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@situacao", funcaoFuncionario.Situacao);
            command.Parameters.AddWithValue("@dataCriacao", funcaoFuncionario.DataCriacao);
            command.Parameters.AddWithValue("@dataAlteracao", funcaoFuncionario.DataAlteracao ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@userCriacao", funcaoFuncionario.UserCriacao ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@userAtualizacao", funcaoFuncionario.UserAtualizacao ?? (object)DBNull.Value);
        }
    }
}
