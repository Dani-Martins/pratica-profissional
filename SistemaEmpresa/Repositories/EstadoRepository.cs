using SistemaEmpresa.Data;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Models;
using SistemaEmpresa.Extensions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Threading.Tasks;
using Dapper;

namespace SistemaEmpresa.Repositories
{
    public class EstadoRepository
    {
        private readonly ApplicationDbContext _context;

        public EstadoRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<Estado>> GetAllAsync()
        {
            return await _context.Estados.ToListAsync();
        }

        public async Task<List<EstadoDTO>> ReadAll()
        {
            try
            {
                // Usar Entity Framework com Include para trazer os dados relacionados
                var estados = await _context.Estados
                    .Include(e => e.Pais)
                    .OrderBy(e => e.Nome)                    .Select(e => new EstadoDTO
                    {
                        Id = e.Id,
                        Nome = e.Nome,
                        UF = e.UF,
                        PaisId = e.PaisId,
                        PaisNome = e.Pais != null ? e.Pais.Nome : string.Empty,
                        Situacao = e.Situacao,
                        DataCriacao = e.DataCriacao,
                        DataAtualizacao = e.DataAtualizacao,
                        UserCriacao = e.UserCriacao,
                        UserAtualizacao = e.UserAtualizacao
                    })
                    .ToListAsync();
                    
                return estados;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar estados: {ex.Message}");
                throw;
            }
        }

        public async Task<EstadoDTO?> ReadById(long id)
        {
            try
            {
                await _context.Database.OpenConnectionAsync();
                
                using var command = _context.Database.GetDbConnection().CreateCommand();                command.CommandText = @"
                    SELECT e.id, e.nome, e.uf, e.pais_id, 
                           e.situacao, e.data_criacao, e.data_atualizacao,
                           e.user_criacao, e.user_atualizacao,
                           p.id as pais_id, p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo
                    FROM estado e
                    LEFT JOIN pais p ON e.pais_id = p.id
                    WHERE e.id = @id";
                
                var parameter = command.CreateParameter();
                parameter.ParameterName = "@id";
                parameter.Value = id;
                command.Parameters.Add(parameter);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearEstadoDTO(reader);
                }
                
                return null;
            }
            finally
            {
                await _context.Database.CloseConnectionAsync();
            }
        }

        public async Task<bool> Create(Estado estado)
        {
            try
            {
                await _context.Database.OpenConnectionAsync();

                // Verificar se o país existe
                using var checkCommand = _context.Database.GetDbConnection().CreateCommand();
                checkCommand.CommandText = "SELECT COUNT(*) FROM pais WHERE id = @paisId";
                
                var checkParameter = checkCommand.CreateParameter();
                checkParameter.ParameterName = "@paisId";
                checkParameter.Value = estado.PaisId;
                checkCommand.Parameters.Add(checkParameter);
                
                var paisExists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync()) > 0;

                if (!paisExists)
                    throw new InvalidOperationException($"País com ID {estado.PaisId} não encontrado");

                using var command = _context.Database.GetDbConnection().CreateCommand();                command.CommandText = @"
                    INSERT INTO estado (nome, uf, pais_id, situacao, data_criacao, user_criacao) 
                    VALUES (@nome, @uf, @paisId, @situacao, @dataCriacao, @userCriacao);
                    SELECT LAST_INSERT_ID();";
                
                var nomeParameter = command.CreateParameter();
                nomeParameter.ParameterName = "@nome";
                nomeParameter.Value = estado.Nome;
                command.Parameters.Add(nomeParameter);
                
                var ufParameter = command.CreateParameter();
                ufParameter.ParameterName = "@uf";
                ufParameter.Value = estado.UF;
                command.Parameters.Add(ufParameter);
                  var paisIdParameter = command.CreateParameter();
                paisIdParameter.ParameterName = "@paisId";
                paisIdParameter.Value = estado.PaisId;
                command.Parameters.Add(paisIdParameter);
                
                var situacaoParameter = command.CreateParameter();
                situacaoParameter.ParameterName = "@situacao";
                situacaoParameter.Value = estado.Situacao;
                command.Parameters.Add(situacaoParameter);
                
                var dataCriacaoParameter = command.CreateParameter();
                dataCriacaoParameter.ParameterName = "@dataCriacao";
                dataCriacaoParameter.Value = DateTime.Now;
                command.Parameters.Add(dataCriacaoParameter);
                
                var userCriacaoParameter = command.CreateParameter();
                userCriacaoParameter.ParameterName = "@userCriacao";
                userCriacaoParameter.Value = estado.UserCriacao ?? (object)DBNull.Value;
                command.Parameters.Add(userCriacaoParameter);
                
                estado.Id = (int)Convert.ToInt64(await command.ExecuteScalarAsync());
                return estado.Id > 0;
            }
            finally
            {
                await _context.Database.CloseConnectionAsync();
            }
        }

        public async Task<bool> Update(long id, Estado estado)
        {
            try
            {
                await _context.Database.OpenConnectionAsync();

                using var command = _context.Database.GetDbConnection().CreateCommand();                command.CommandText = @"
                    UPDATE estado 
                    SET nome = @nome, uf = @uf, pais_id = @paisId,
                        situacao = @situacao, data_atualizacao = @dataAtualizacao, 
                        user_atualizacao = @userAtualizacao
                    WHERE id = @id";
                
                var idParameter = command.CreateParameter();
                idParameter.ParameterName = "@id";
                idParameter.Value = id;
                command.Parameters.Add(idParameter);
                
                var nomeParameter = command.CreateParameter();
                nomeParameter.ParameterName = "@nome";
                nomeParameter.Value = estado.Nome;
                command.Parameters.Add(nomeParameter);
                
                var ufParameter = command.CreateParameter();
                ufParameter.ParameterName = "@uf";
                ufParameter.Value = estado.UF;
                command.Parameters.Add(ufParameter);
                  var paisIdParameter = command.CreateParameter();
                paisIdParameter.ParameterName = "@paisId";
                paisIdParameter.Value = estado.PaisId;
                command.Parameters.Add(paisIdParameter);
                
                var situacaoParameter = command.CreateParameter();
                situacaoParameter.ParameterName = "@situacao";
                situacaoParameter.Value = estado.Situacao;
                command.Parameters.Add(situacaoParameter);
                
                var dataAtualizacaoParameter = command.CreateParameter();
                dataAtualizacaoParameter.ParameterName = "@dataAtualizacao";
                dataAtualizacaoParameter.Value = DateTime.Now;
                command.Parameters.Add(dataAtualizacaoParameter);
                
                var userAtualizacaoParameter = command.CreateParameter();
                userAtualizacaoParameter.ParameterName = "@userAtualizacao";
                userAtualizacaoParameter.Value = estado.UserAtualizacao ?? (object)DBNull.Value;
                command.Parameters.Add(userAtualizacaoParameter);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                await _context.Database.CloseConnectionAsync();
            }
        }        public async Task<bool> Delete(long id)
        {
            try
            {
                // Primeiro, encontrar o estado no contexto
                var estado = await _context.Estados.FindAsync(id);
                
                if (estado == null)
                {
                    return false; // Estado não encontrado
                }
                
                // Em vez de remover do contexto, alteramos a situação para 0 (inativo)
                estado.Situacao = false;
                estado.DataAtualizacao = DateTime.Now;
                estado.UserAtualizacao = "SISTEMA";
                
                // Salvar as alterações
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"EstadoRepository.Delete: Atualizando situação do estado ID {id} para inativo.");
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao inativar estado ID {id}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<EstadoDTO>> ReadByPaisId(long paisId) // Alterado de int para long
        {
            var estados = new List<EstadoDTO>();
            
            try
            {
                await _context.Database.OpenConnectionAsync();
                
                using var command = _context.Database.GetDbConnection().CreateCommand();
                command.CommandText = @"
                    SELECT e.id, e.nome, e.uf, e.pais_id, 
                           p.id as pais_id, p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo
                    FROM estado e
                    LEFT JOIN pais p ON e.pais_id = p.id
                    WHERE e.pais_id = @paisId
                    ORDER BY e.nome";
                
                var parameter = command.CreateParameter();
                parameter.ParameterName = "@paisId";
                parameter.Value = paisId;
                command.Parameters.Add(parameter);
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    estados.Add(MapearEstadoDTO(reader));
                }
            }
            finally
            {
                await _context.Database.CloseConnectionAsync();
            }
            
            return estados;
        }        public async Task<List<Estado>> ReadByPaisIdWithPais(long paisId)
        {
            try
            {
                var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();
                
                string sql = @"
                    SELECT e.id, e.nome, e.uf, e.pais_id as PaisId, 
                           CAST(COALESCE(e.situacao, 0) AS SIGNED) as Situacao,
                           e.data_criacao as DataCriacao, e.data_atualizacao as DataAtualizacao,
                           e.user_criacao as UserCriacao, e.user_atualizacao as UserAtualizacao,
                           p.id as PaisId, p.nome as PaisNome
                    FROM estado e
                    LEFT JOIN pais p ON e.pais_id = p.id
                    WHERE e.pais_id = @paisId
                    ORDER BY e.nome";
                
                var estados = new List<Estado>();
                
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = sql;
                    
                    var parameter = command.CreateParameter();
                    parameter.ParameterName = "@paisId";
                    parameter.Value = paisId;
                    command.Parameters.Add(parameter);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var estado = new Estado
                            {
                                Id = reader.GetInt64(reader.GetOrdinal("id")),
                                Nome = reader.GetString(reader.GetOrdinal("nome")),
                                UF = reader.GetString(reader.GetOrdinal("uf")),
                                PaisId = reader.GetInt64(reader.GetOrdinal("PaisId")),
                                Situacao = reader.GetInt32(reader.GetOrdinal("Situacao")) == 1,
                                DataCriacao = reader.IsDBNull(reader.GetOrdinal("DataCriacao")) ? 
                                    DateTime.Now : reader.GetDateTime(reader.GetOrdinal("DataCriacao")),
                                Pais = new Pais
                                {
                                    Id = reader.GetInt64(reader.GetOrdinal("PaisId")),
                                    Nome = reader.GetString(reader.GetOrdinal("PaisNome"))
                                }
                            };
                            estados.Add(estado);
                        }
                    }
                }
                
                await connection.CloseAsync();
                return estados;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar estados por país: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Verifica se um país com o ID informado existe
        /// </summary>
        /// <param name="paisId">ID do país</param>
        /// <returns>True se o país existir, False caso contrário</returns>
        public async Task<bool> PaisExists(long paisId)
        {
            // Implemente de acordo com sua fonte de dados
            // Por exemplo, se estiver usando Entity Framework:
            // return await _context.Paises.AnyAsync(p => p.Id == paisId);
            
            // Substitua esta implementação temporária:
            return await Task.FromResult(true);
        }

        public async Task<List<Estado>> ReadAllWithPaisDapper()
        {
            try
            {
                var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();
                
                string sql = @"
                    SELECT e.id, e.nome, e.uf, e.pais_id as PaisId,
                           p.nome as PaisNome, p.sigla as PaisSigla, p.codigo_telefonico as Codigo
                    FROM estado e
                    LEFT JOIN pais p ON e.pais_id = p.id
                    ORDER BY e.nome";
                
                var estados = await connection.QueryAsync<Estado, Pais, Estado>(
                    sql,
                    (estado, pais) => 
                    {
                        // Garantir que o UF não seja nulo
                        estado.UF = estado.UF ?? string.Empty;
                        
                        if (pais != null)
                        {
                            // Garantir que as propriedades do país não sejam nulas
                            pais.Nome = pais.Nome ?? string.Empty;
                            pais.Sigla = pais.Sigla ?? string.Empty;
                            pais.Codigo = pais.Codigo ?? string.Empty;
                            
                            estado.Pais = pais;
                        }
                        
                        return estado;
                    },
                    splitOn: "PaisNome"
                );
                return estados.ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERRO ao buscar estados: {ex.Message}");
                throw new Exception($"Erro ao buscar estados: {ex.Message}");
            }
            finally
            {
                if (_context.Database.GetDbConnection().State == ConnectionState.Open)
                    await _context.Database.CloseConnectionAsync();
            }
        }

        public async Task<IEnumerable<Estado>> ReadAllWithPais()
        {
            try
            {
                // Usar SQL direto para evitar problemas com o EF Core
                var connection = _context.Database.GetDbConnection();
                if (connection.State != System.Data.ConnectionState.Open)
                    await connection.OpenAsync();
                    
                string sql = @"
                    SELECT e.id, e.nome, e.uf, e.pais_id,
                           p.id as PaisId, p.nome as PaisNome, p.sigla as PaisSigla, p.codigo as PaisCodigo
                    FROM estado e
                    LEFT JOIN pais p ON e.pais_id = p.id
                    ORDER BY e.nome";
                    
                var resultados = await connection.QueryAsync<Estado, Pais, Estado>(sql,
                    (estado, pais) => {
                        if (pais != null)
                        {
                            estado.Pais = pais;
                            estado.PaisNome = pais.Nome;
                        }
                        return estado;
                    },
                    splitOn: "PaisId");
                    
                return resultados;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar estados: {ex.Message}");
                throw new Exception($"Erro ao buscar estados: {ex.Message}");
            }
        }

        public async Task<IEnumerable<Estado>> ReadAllWithRawData()
        {
            try
            {
                await _context.Database.OpenConnectionAsync();
                
                var connection = _context.Database.GetDbConnection();
                
                string sql = @"
                    SELECT e.id, e.nome, e.uf, e.pais_id as PaisId,
                           p.nome as PaisNome, p.sigla as PaisSigla, p.codigo as PaisCodigo
                    FROM estado e
                    LEFT JOIN pais p ON e.pais_id = p.id
                    ORDER BY e.nome";
                
                var estados = await connection.QueryAsync<Estado, Pais, Estado>(
                    sql,
                    (estado, pais) => 
                    {
                        // Tratamento para campos possivelmente nulos
                        estado.UF = estado.UF ?? string.Empty;
                        
                        if (pais != null)
                        {
                            pais.Nome = pais.Nome ?? string.Empty;
                            pais.Sigla = pais.Sigla ?? string.Empty;
                            pais.Codigo = pais.Codigo ?? string.Empty;
                            
                            estado.Pais = pais;
                        }
                        
                        return estado;
                    },
                    splitOn: "PaisNome"
                );
                
                return estados;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERRO ao buscar estados: {ex.Message}");
                throw new Exception($"Erro ao buscar estados: {ex.Message}", ex);
            }
            finally
            {
                await _context.Database.CloseConnectionAsync();
            }
        }        private EstadoDTO MapearEstadoDTO(DbDataReader reader)
        {
            var estadoDto = new EstadoDTO
            {
                Id = reader.GetInt64(reader.GetOrdinal("id")),
                Nome = reader.IsDBNull(reader.GetOrdinal("nome")) ? string.Empty : reader.GetString(reader.GetOrdinal("nome")),
                UF = reader.IsDBNull(reader.GetOrdinal("uf")) ? string.Empty : reader.GetString(reader.GetOrdinal("uf")),
                PaisId = reader.IsDBNull(reader.GetOrdinal("pais_id")) ? 0 : reader.GetInt64(reader.GetOrdinal("pais_id")),
                PaisNome = reader.IsDBNull(reader.GetOrdinal("pais_nome")) ? string.Empty : reader.GetString(reader.GetOrdinal("pais_nome")),
                Situacao = reader.HasColumn("situacao") && !reader.IsDBNull(reader.GetOrdinal("situacao")) ? reader.GetBoolean(reader.GetOrdinal("situacao")) : true,
                DataCriacao = reader.HasColumn("data_criacao") && !reader.IsDBNull(reader.GetOrdinal("data_criacao")) ? reader.GetDateTime(reader.GetOrdinal("data_criacao")) : DateTime.Now,
                DataAtualizacao = reader.HasColumn("data_atualizacao") && !reader.IsDBNull(reader.GetOrdinal("data_atualizacao")) ? reader.GetDateTime(reader.GetOrdinal("data_atualizacao")) : null,
                UserCriacao = reader.HasColumn("user_criacao") && !reader.IsDBNull(reader.GetOrdinal("user_criacao")) ? reader.GetString(reader.GetOrdinal("user_criacao")) : null,
                UserAtualizacao = reader.HasColumn("user_atualizacao") && !reader.IsDBNull(reader.GetOrdinal("user_atualizacao")) ? reader.GetString(reader.GetOrdinal("user_atualizacao")) : null            };

            return estadoDto;
        }

        /// <summary>
        /// Verifica se já existe um estado com a mesma UF no mesmo país
        /// </summary>
        /// <param name="uf">UF/Sigla do estado</param>
        /// <param name="paisId">ID do país</param>
        /// <param name="estadoId">ID do estado atual (opcional, para ignorar na validação em caso de atualização)</param>
        /// <returns>True se já existir, False caso contrário</returns>
        public async Task<bool> ExisteUFDuplicadaNoPais(string uf, long paisId, long? estadoId = null)
        {
            try
            {
                await _context.Database.OpenConnectionAsync();
                
                using var command = _context.Database.GetDbConnection().CreateCommand();
                
                // SQL base para verificar UF duplicada no mesmo país
                string sql = @"
                    SELECT COUNT(*) 
                    FROM estado 
                    WHERE UPPER(uf) = UPPER(@uf) 
                    AND pais_id = @paisId";
                
                // Se tiver ID, adiciona condição para ignorar o próprio estado
                if (estadoId.HasValue && estadoId.Value > 0)
                {
                    sql += " AND id <> @estadoId";
                }
                
                command.CommandText = sql;
                
                var ufParameter = command.CreateParameter();
                ufParameter.ParameterName = "@uf";
                ufParameter.Value = uf;
                command.Parameters.Add(ufParameter);
                
                var paisIdParameter = command.CreateParameter();
                paisIdParameter.ParameterName = "@paisId";
                paisIdParameter.Value = paisId;
                command.Parameters.Add(paisIdParameter);
                
                if (estadoId.HasValue && estadoId.Value > 0)
                {
                    var estadoIdParameter = command.CreateParameter();
                    estadoIdParameter.ParameterName = "@estadoId";
                    estadoIdParameter.Value = estadoId.Value;
                    command.Parameters.Add(estadoIdParameter);
                }
                
                var count = Convert.ToInt32(await command.ExecuteScalarAsync());
                return count > 0;
            }
            finally
            {
                await _context.Database.CloseConnectionAsync();
            }
        }
    }
}
