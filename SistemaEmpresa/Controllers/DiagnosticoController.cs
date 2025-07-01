using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using System.Data;
using SistemaEmpresa.Data; // Add this line to import ApplicationDbContext
using System;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class DiagnosticoController : ControllerBase
    {
        private readonly MySqlConnection _connection;
        private readonly IWebHostEnvironment _env;

        public DiagnosticoController(MySqlConnection connection, IWebHostEnvironment env)
        {
            _connection = connection;
            _env = env;
        }

        [HttpGet("status")]
        public IActionResult Status()
        {
            return Ok(new { 
                status = "online",
                timestamp = DateTime.Now,
                version = "1.0.0",
                cors = "Configurado corretamente" 
            });
        }

        [HttpGet]
        [ProducesResponseType(typeof(Dictionary<string, object>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Dictionary<string, object>>> GetStatus()
        {
            var status = new Dictionary<string, object>();
            try
            {
                await _connection.OpenAsync();
                status["database"] = "Conectado";
                status["version"] = _connection.ServerVersion;
                status["estado"] = "Serviço ativo";
                status["ambiente"] = _env.EnvironmentName;
                status["timestamp"] = DateTime.Now;
                await _connection.CloseAsync();
            }
            catch (Exception ex)
            {
                status["database"] = "Erro de conexão";
                status["erro"] = ex.Message;
                return StatusCode(500, status);
            }

            return Ok(status);
        }

        [HttpGet("verificar-pais")]
        public async Task<ActionResult<Dictionary<string, object>>> VerificarPais()
        {
            var response = new Dictionary<string, object>();
            try
            {
                await _connection.OpenAsync();
                
                // Verificar se tabela existe
                var tabelaExiste = false;
                using (var cmd = new MySqlCommand(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'pais'", 
                    _connection))
                {
                    var result = await cmd.ExecuteScalarAsync();
                    tabelaExiste = Convert.ToInt32(result) > 0;
                }
                response["tabela_pais_existe"] = tabelaExiste;

                if (tabelaExiste)
                {
                    // Verificar registros
                    var paises = new List<Dictionary<string, object>>();
                    using (var cmd = new MySqlCommand("SELECT id, nome FROM pais", _connection))
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            paises.Add(new Dictionary<string, object>
                            {
                                ["id"] = reader.GetInt64(0),
                                ["nome"] = reader.GetString(1)
                            });
                        }
                    }
                    response["paises_encontrados"] = paises;
                    response["total_paises"] = paises.Count;
                }

                response["status"] = "OK";
            }
            catch (Exception ex)
            {
                response["status"] = "ERRO";
                response["mensagem"] = ex.Message;
                return StatusCode(500, response);
            }
            finally
            {
                await _connection.CloseAsync();
            }

            return Ok(response);
        }

        [HttpGet("corrigir-pais")]
        public async Task<ActionResult<Dictionary<string, object>>> CorrigirPais()
        {
            var response = new Dictionary<string, object>();
            try
            {
                await _connection.OpenAsync();
                await using var transaction = await _connection.BeginTransactionAsync();

                try
                {
                    // Verificar se existe país com ID 1
                    using (var cmd = new MySqlCommand(
                        "SELECT COUNT(*) FROM pais WHERE id = 1", _connection))
                    {
                        var exists = Convert.ToInt32(await cmd.ExecuteScalarAsync()) > 0;
                        if (!exists)
                        {
                            // Inserir Brasil como ID 1
                            using var insertCmd = new MySqlCommand(@"
                                INSERT INTO pais (id, nome, codigo_iso2, codigo_iso3, codigo_numerico, codigo_telefone) 
                                VALUES (1, 'Brasil', 'BR', 'BRA', '076', '55')", _connection);
                            await insertCmd.ExecuteNonQueryAsync();
                            response["pais_inserido"] = true;
                        }
                        else
                        {
                            response["pais_ja_existe"] = true;
                        }
                    }

                    await transaction.CommitAsync();
                    response["status"] = "OK";
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw new Exception("Erro ao corrigir país", ex);
                }
            }
            catch (Exception ex)
            {
                response["status"] = "ERRO";
                response["mensagem"] = ex.Message;
                return StatusCode(500, response);
            }
            finally
            {
                await _connection.CloseAsync();
            }

            return Ok(response);
        }

        [HttpGet("endpoints")]
        public ActionResult<Dictionary<string, string>> ListarEndpoints()
        {
            var endpoints = new Dictionary<string, string>
            {
                ["/api/diagnostico"] = "Verificar status do sistema",
                ["/api/diagnostico/verificar-pais"] = "Verificar tabela e registros de país",
                ["/api/diagnostico/corrigir-pais"] = "Corrigir registros da tabela país",
                ["/api/diagnostico/endpoints"] = "Listar endpoints disponíveis",
                ["/api/diagnostico/db-status"] = "Verificar status da conexão com banco de dados"
            };

            return Ok(endpoints);
        }

        [HttpGet("db-status")]
        public IActionResult GetDBStatus()
        {
            try
            {
                // Verificação simplificada usando a conexão já existente
                var canConnect = false;
                try
                {
                    _connection.Open();
                    canConnect = _connection.State == ConnectionState.Open;
                    _connection.Close();
                }
                catch
                {
                    canConnect = false;
                }

                return Ok(new
                {
                    Status = canConnect ? "OK" : "Falha",
                    Mensagem = canConnect ? "Conexão com o banco de dados estabelecida com sucesso" : "Não foi possível conectar ao banco de dados"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Status = "Erro",
                    Mensagem = "Erro ao verificar conexão com o banco de dados",
                    Detalhes = ex.Message
                });
            }
        }

        [HttpGet("check")]
        public IActionResult Get()
        {
            return Ok(new
            {
                message = "API está funcionando corretamente",
                timestamp = DateTime.Now
            });
        }
    }
}