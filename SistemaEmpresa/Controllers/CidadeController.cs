using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MySqlConnector;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Models;
using SistemaEmpresa.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class CidadeController : ControllerBase
    {
        private readonly CidadeService _cidadeService;

        public CidadeController(CidadeService cidadeService)
        {
            _cidadeService = cidadeService;
        }

        /// <summary>
        /// Obtém todas as cidades cadastradas
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Cidade>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Cidade>>> GetAll()
        {
            try
            {
                var cidades = await _cidadeService.GetAllAsync();
                return Ok(cidades);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar cidades", erro = ex.Message });
            }
        }

        /// <summary>
        /// Obtém uma cidade pelo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Cidade), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Cidade>> GetById(long id)
        {
            try
            {
                var cidade = await _cidadeService.GetByIdAsync(id);
                return Ok(cidade);
            }
            catch (Exception ex) when (ex.Message.Contains("não encontrada"))
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar cidade", erro = ex.Message });
            }
        }

        /// <summary>
        /// Obtém cidades pelo ID do estado
        /// </summary>
        [HttpGet("estado/{estadoId}")]
        [ProducesResponseType(typeof(IEnumerable<Cidade>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Cidade>>> GetByEstadoId(long estadoId)
        {
            try
            {
                var cidades = await _cidadeService.GetByEstadoIdAsync(estadoId);
                return Ok(cidades);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar cidades por estado", erro = ex.Message });
            }
        }

        /// <summary>
        /// Cadastra uma nova cidade
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(Cidade), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Cidade>> Create([FromBody] CidadeCreateDTO cidadeDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Verificar explicitamente se o estado existe
                var estado = await _cidadeService.GetEstadoByIdAsync(cidadeDTO.EstadoId);
                if (estado == null)
                {
                    return BadRequest(new { 
                        mensagem = $"Estado com ID {cidadeDTO.EstadoId} não existe no banco de dados.",
                        sugestao = "Verifique se o ID do estado está correto ou cadastre o estado primeiro."
                    });
                }

                var cidade = new Cidade
                {
                    Nome = cidadeDTO.Nome,
                    CodigoIBGE = cidadeDTO.CodigoIBGE,
                    EstadoId = cidadeDTO.EstadoId
                };

                // Use o método padrão para criar cidades
                await _cidadeService.SaveAsync(cidade);
                return CreatedAtAction(nameof(GetById), new { id = cidade.Id }, cidade);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao criar cidade: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                if (ex.InnerException != null)
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                
                return StatusCode(500, new { 
                    mensagem = "Erro ao criar cidade", 
                    erro = ex.Message,
                    detalhes = ex.InnerException?.Message ?? "Sem detalhes adicionais" 
                });
            }
        }        /// <summary>
        /// Atualiza os dados de uma cidade
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(long id, [FromBody] CidadeUpdateDTO cidadeDTO)
        {
            try
            {
                // Log detalhado para depuração
                Console.WriteLine($"Recebendo atualização para cidade ID: {id}");
                Console.WriteLine($"Dados recebidos: Nome={cidadeDTO.Nome}, CodigoIBGE={cidadeDTO.CodigoIBGE}, EstadoId={cidadeDTO.EstadoId}");
                
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    
                    Console.WriteLine($"Erros de validação: {string.Join(", ", errors)}");
                    return BadRequest(ModelState);
                }
                
                var cidadeExistente = await _cidadeService.GetByIdAsync(id);
                
                cidadeExistente.Nome = cidadeDTO.Nome;
                cidadeExistente.CodigoIBGE = cidadeDTO.CodigoIBGE;
                cidadeExistente.EstadoId = cidadeDTO.EstadoId;
                
                // Atualizar o campo situacao se ele estiver presente no DTO
                if (cidadeDTO.GetType().GetProperty("Situacao") != null)
                {
                    var situacaoProperty = cidadeDTO.GetType().GetProperty("Situacao");
                    if (situacaoProperty != null)
                    {
                        var situacaoValue = situacaoProperty.GetValue(cidadeDTO);
                        if (situacaoValue != null)
                        {
                            cidadeExistente.Situacao = (bool)situacaoValue;
                        }
                    }
                }

                await _cidadeService.SaveAsync(cidadeExistente);
                return NoContent();
            }
            catch (Exception ex) when (ex.Message.Contains("não encontrada"))
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao atualizar cidade {id}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                if (ex.InnerException != null)
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                
                return StatusCode(500, new { mensagem = "Erro ao atualizar cidade", erro = ex.Message });
            }
        }/// <summary>
        /// Inativa uma cidade (não remove do banco de dados)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                // Verificar se a cidade existe
                var cidade = await _cidadeService.GetByIdAsync(id);
                if (cidade == null)
                {
                    return NotFound(new { mensagem = $"Cidade com ID {id} não encontrada." });
                }

                // Verificar se há registros dependentes
                try
                {
                    bool temDependencias = await _cidadeService.TemDependencias(id);
                    
                    if (temDependencias)
                    {
                        return BadRequest(new { 
                            mensagem = "Não é possível inativar esta cidade pois existem registros vinculados a ela." 
                        });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao verificar dependências: {ex.Message}");
                    return StatusCode(500, new { 
                        mensagem = "Erro ao verificar dependências", 
                        erro = ex.Message 
                    });
                }
                
                // Em vez de excluir, vamos inativar a cidade (situacao = 0)
                try
                {                    // Conectar diretamente ao banco e inativar a cidade
                    var configuration = HttpContext.RequestServices
                        .GetService(typeof(Microsoft.Extensions.Configuration.IConfiguration)) as 
                        Microsoft.Extensions.Configuration.IConfiguration;
                    
                    if (configuration == null)
                    {
                        throw new InvalidOperationException("Não foi possível obter a configuração de conexão");
                    }
                    
                    string? connStr = configuration.GetConnectionString("DefaultConnection");
                    if (string.IsNullOrEmpty(connStr))
                    {
                        throw new InvalidOperationException("String de conexão 'DefaultConnection' não encontrada");
                    }
                    using var connection = new MySqlConnector.MySqlConnection(connStr);
                    await connection.OpenAsync();
                    
                    // Atualizar a situação para 0 (inativo)
                    var updateCommand = new MySqlConnector.MySqlCommand(
                        @"UPDATE cidade 
                          SET Situacao = 0, 
                              data_atualizacao = NOW(), 
                              user_atualizacao = 'SISTEMA_CONTROLLER' 
                          WHERE id = @id", 
                        connection);
                    updateCommand.Parameters.AddWithValue("@id", id);
                    
                    var rowsAffected = await updateCommand.ExecuteNonQueryAsync();
                    
                    if (rowsAffected > 0)
                    {
                        Console.WriteLine($"CidadeController.Delete: Cidade ID {id} inativada com sucesso");
                        return NoContent(); // Status 204 para manter consistência com outros endpoints
                    }
                    else
                    {
                        return StatusCode(500, new { 
                            mensagem = $"Falha ao inativar a cidade ID {id}" 
                        });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao inativar cidade: {ex.Message}");
                    return StatusCode(500, new { 
                        mensagem = "Erro ao inativar cidade", 
                        erro = ex.Message 
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro geral ao processar inativação: {ex.Message}");
                return StatusCode(500, new { 
                    mensagem = "Erro ao processar inativação da cidade", 
                    erro = ex.Message 
                });
            }
        }

        [HttpPost("Excluir/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ExcluirPost(long id)
        {
            // Simplesmente chama o método Delete existente
            return await Delete(id);
        }

        [HttpPost("ExcluirForcado/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ExcluirForcado(long id)
        {
            try
            {
                // Verificar se a cidade existe
                var cidade = await _cidadeService.GetByIdAsync(id);
                if (cidade == null)
                {
                    return NotFound(new { mensagem = $"Cidade com ID {id} não encontrada." });
                }

                // Chamar o método de exclusão forçada
                await _cidadeService.ExcluirForcado(id);
                return Ok(new { mensagem = "Cidade excluída com sucesso (modo forçado)." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao excluir cidade (modo forçado): {ex.Message}");
                return StatusCode(500, new { 
                    mensagem = "Erro ao excluir cidade", 
                    erro = ex.Message 
                });
            }
        }

        [HttpPost("debug")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> TesteInsercaoDireta([FromBody] CidadeCreateDTO cidadeDTO)
        {
            try
            {
                await _cidadeService.InsercaoDiretaDebug(
                    cidadeDTO.Nome, 
                    cidadeDTO.CodigoIBGE, 
                    cidadeDTO.EstadoId);
                
                return Ok(new { 
                    mensagem = "Inserção de teste bem-sucedida", 
                    cidadeDTO = cidadeDTO 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("PorEstado/{estadoId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetByEstado(long estadoId)
        {
            try
            {
                Console.WriteLine($"Buscando cidades para o estado ID: {estadoId}");
                var cidades = await _cidadeService.GetByEstadoIdAsync(estadoId);
                
                // Log para depuração
                Console.WriteLine($"Encontradas {cidades.Count()} cidades para o estado {estadoId}");
                
                return Ok(cidades);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar cidades por estado: {ex.Message}");
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }
    }
}