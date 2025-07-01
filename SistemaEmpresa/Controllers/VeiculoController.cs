using Microsoft.AspNetCore.Mvc;
using SistemaEmpresa.Models;
using SistemaEmpresa.Models.DTOs;
using SistemaEmpresa.Repositories;
using SistemaEmpresa.Services;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class VeiculoController : ControllerBase
    {
        private readonly VeiculoRepository _veiculoRepo;
        private readonly VeiculoService _veiculoService;

        public VeiculoController(VeiculoRepository veiculoRepo, VeiculoService veiculoService)
        {
            _veiculoRepo = veiculoRepo;
            _veiculoService = veiculoService;
        }

        /// <summary>
        /// Lista todos os veículos ativos
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Veiculo>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Veiculo>>> Get()
        {
            try
            {
                var veiculos = await _veiculoRepo.ReadAll();
                return Ok(veiculos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar veículos", erro = ex.Message });
            }
        }

        /// <summary>
        /// Obtém um veículo pelo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Veiculo), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Veiculo>> GetById(long id)
        {
            try
            {
                var veiculo = await _veiculoRepo.ReadById(id);
                if (veiculo == null)
                    return NotFound(new { mensagem = $"Veículo com ID {id} não encontrado" });

                return Ok(veiculo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar veículo", erro = ex.Message });
            }
        }

        /// <summary>
        /// Cadastra um novo veículo
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(Veiculo), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Veiculo>> Post([FromBody] VeiculoCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var veiculo = new Veiculo
                {
                    Placa = dto.Placa,
                    Modelo = dto.Modelo,
                    Marca = dto.Marca,
                    Ano = dto.Ano,
                    Capacidade = dto.Capacidade,
                    TransportadoraId = dto.TransportadoraId,
                    Ativo = dto.Ativo
                };

                var sucesso = await _veiculoRepo.Create(veiculo);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao criar veículo" });

                // Após criar, carrega o veículo completo com suas propriedades de navegação
                var veiculoCriado = await _veiculoRepo.ReadById(veiculo.Id);
                return CreatedAtAction(nameof(GetById), new { id = veiculo.Id }, veiculoCriado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar veículo", erro = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza um veículo existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(Veiculo), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Veiculo>> Put(long id, [FromBody] Veiculo veiculo)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var veiculoExistente = await _veiculoRepo.ReadById(id);
                if (veiculoExistente == null)
                    return NotFound(new { mensagem = $"Veículo com ID {id} não encontrado" });

                var sucesso = await _veiculoRepo.Update(id, veiculo);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao atualizar veículo" });

                return Ok(veiculo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar veículo", erro = ex.Message });
            }
        }

        /// <summary>
        /// Remove um veículo
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(long id)
        {
            try
            {
                var veiculo = await _veiculoRepo.ReadById(id);
                if (veiculo == null)
                    return NotFound(new { mensagem = $"Veículo com ID {id} não encontrado" });

                var sucesso = await _veiculoRepo.Delete(id);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao excluir veículo" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir veículo", erro = ex.Message });
            }
        }
    }
}