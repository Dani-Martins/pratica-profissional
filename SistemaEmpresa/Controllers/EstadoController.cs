using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SistemaEmpresa.Models;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Services;
using SistemaEmpresa.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Swashbuckle.AspNetCore.Annotations;
using Dapper;
using MySqlConnector;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class EstadoController : ControllerBase
    {
        private readonly EstadoService _estadoService;
        private readonly IConfiguration _configuration;

        public EstadoController(EstadoService estadoService, IConfiguration configuration)
        {
            _estadoService = estadoService;
            _configuration = configuration;
        }

        // GET: api/Estado
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<EstadoDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Lista todos os estados")]
        public async Task<IActionResult> GetAll()
        {
            try
            {                // Usar a mesma abordagem do método detalhado que sabemos que funciona
                var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();
                  string sql = @"
                    SELECT e.id as Id, e.nome as Nome, 
                           COALESCE(e.uf, '') as UF, 
                           e.pais_id as PaisId,
                           COALESCE(p.nome, '') as PaisNome,
                           CAST(COALESCE(e.situacao, 0) AS SIGNED) as Situacao,
                           e.data_criacao as DataCriacao,
                           e.data_atualizacao as DataAtualizacao,
                           e.user_criacao as UserCriacao,
                           e.user_atualizacao as UserAtualizacao
                    FROM estado e
                    LEFT JOIN pais p ON e.pais_id = p.id
                    ORDER BY e.nome";
                
                var estados = await connection.QueryAsync<EstadoDTO>(sql);
                await connection.CloseAsync();
                
                return Ok(estados);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        // POST: api/Estado
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Cadastra um novo estado")]
        public async Task<IActionResult> Create([FromBody] EstadoCreateDTO estadoDTO)
        {
            try
            {
                var estado = await _estadoService.Create(estadoDTO);
                return CreatedAtAction(nameof(GetById), new { id = estado.Id }, estado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        // GET: api/Estado/{id}
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Obtém um estado pelo ID")]
        public async Task<IActionResult> GetById(long id)
        {
            try
            {
                var estado = await _estadoService.GetById(id);
                if (estado == null)
                    return NotFound($"Estado com ID {id} não encontrado");
                
                return Ok(estado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        // PUT: api/Estado/{id}
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Atualiza um estado existente")]
        public async Task<IActionResult> Update(long id, [FromBody] EstadoUpdateDTO estadoDTO)
        {
            try
            {
                // Define o ID a partir da URL, não do corpo da requisição
                estadoDTO.Id = id;
                
                // Chama o serviço para atualizar
                var estado = await _estadoService.Update(id, estadoDTO);
                return Ok(estado);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("não encontrado"))
                    return NotFound(ex.Message);
                
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }        // DELETE: api/Estado/{id}
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Inativa um estado (não remove do banco de dados)")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                // Conectar diretamente ao banco e inativar o estado
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                using var connection = new MySqlConnection(connectionString);
                await connection.OpenAsync();
                
                // Verificar se o estado existe
                var checkCommand = new MySqlCommand("SELECT COUNT(*) FROM estado WHERE id = @id", connection);
                checkCommand.Parameters.AddWithValue("@id", id);
                var count = Convert.ToInt32(await checkCommand.ExecuteScalarAsync());
                
                if (count == 0)
                {
                    return NotFound($"Estado com ID {id} não encontrado");
                }
                
                // Atualizar a situação para 0 (inativo)
                var updateCommand = new MySqlCommand(
                    @"UPDATE estado 
                      SET situacao = 0, 
                          data_atualizacao = NOW(), 
                          user_atualizacao = 'SISTEMA_CONTROLLER' 
                      WHERE id = @id", 
                    connection);
                updateCommand.Parameters.AddWithValue("@id", id);
                
                var rowsAffected = await updateCommand.ExecuteNonQueryAsync();
                
                if (rowsAffected > 0)
                {
                    Console.WriteLine($"EstadoController.Delete: Estado ID {id} inativado com sucesso");
                    return NoContent();
                }
                else
                {
                    return StatusCode(500, $"Falha ao inativar o estado ID {id}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao inativar estado ID {id}: {ex.Message}");
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        // GET: api/Estado/porPais/{paisId}
        [HttpGet("porPais/{paisId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Lista todos os estados de um país específico")]
        public async Task<IActionResult> GetByPaisId(long paisId)
        {
            try
            {
                var estados = await _estadoService.GetByPaisId(paisId);
                return Ok(estados);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        // GET: api/Estado/detalhado
        [HttpGet("detalhado")]
        public async Task<IActionResult> Get()
        {
            try
            {
                var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();
                  string sql = @"
                    SELECT e.id as Id, e.nome as Nome, 
                           COALESCE(e.uf, '') as UF, 
                           e.pais_id as PaisId,
                           COALESCE(p.nome, '') as PaisNome,
                           CAST(COALESCE(e.situacao, 0) AS SIGNED) as Situacao,
                           e.data_criacao as DataCriacao,
                           e.data_atualizacao as DataAtualizacao,
                           e.user_criacao as UserCriacao,
                           e.user_atualizacao as UserAtualizacao
                    FROM estado e
                    LEFT JOIN pais p ON e.pais_id = p.id
                    ORDER BY e.nome";
                
                var estados = await connection.QueryAsync<EstadoDTO>(sql);
                await connection.CloseAsync();
                
                return Ok(estados);
            }
            catch (Exception ex)
            {                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }
    }
}