using Microsoft.AspNetCore.Mvc;
using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using SistemaEmpresa.DTOs;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class TransportadoraController : ControllerBase
    {
        private readonly TransportadoraRepository _transportadoraRepo;

        public TransportadoraController(TransportadoraRepository transportadoraRepo)
        {
            _transportadoraRepo = transportadoraRepo;
        }

        /// <summary>
        /// Lista todas as transportadoras ativas
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Transportadora>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Transportadora>>> Get()
        {
            try
            {
                var transportadoras = await _transportadoraRepo.ReadAll();
                return Ok(transportadoras);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar transportadoras", erro = ex.Message });
            }
        }

        /// <summary>
        /// Obtém uma transportadora pelo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Transportadora), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Transportadora>> GetById(long id)
        {
            try
            {
                var transportadora = await _transportadoraRepo.ReadById(id);
                if (transportadora == null)
                    return NotFound(new { mensagem = $"Transportadora com ID {id} não encontrada" });

                return Ok(transportadora);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar transportadora", erro = ex.Message });
            }
        }

        /// <summary>
        /// Cadastra uma nova transportadora
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(Transportadora), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Transportadora>> Post([FromBody] TransportadoraCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var transportadora = new Transportadora
                {
                    RazaoSocial = dto.RazaoSocial,
                    NomeFantasia = dto.NomeFantasia,
                    CNPJ = dto.CNPJ,
                    Email = dto.Email,
                    Telefone = dto.Telefone,
                    Endereco = dto.Endereco,
                    CidadeId = dto.CidadeId,
                    Ativo = dto.Ativo,
                    Numero = dto.Numero,
                    Complemento = dto.Complemento,
                    Bairro = dto.Bairro,
                    Cep = dto.Cep
                };

                var sucesso = await _transportadoraRepo.Create(transportadora);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao criar transportadora" });

                return CreatedAtAction(nameof(GetById), new { id = transportadora.Id }, transportadora);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar transportadora", erro = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza uma transportadora existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(Transportadora), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Transportadora>> Put(long id, [FromBody] Transportadora transportadora)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var transportadoraExistente = await _transportadoraRepo.ReadById(id);
                if (transportadoraExistente == null)
                    return NotFound(new { mensagem = $"Transportadora com ID {id} não encontrada" });

                var sucesso = await _transportadoraRepo.Update(id, transportadora);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao atualizar transportadora" });

                return Ok(transportadora);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar transportadora", erro = ex.Message });
            }
        }

        /// <summary>
        /// Remove uma transportadora
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(long id)
        {
            try
            {
                var transportadora = await _transportadoraRepo.ReadById(id);
                if (transportadora == null)
                    return NotFound(new { mensagem = $"Transportadora com ID {id} não encontrada" });

                // Use the Delete method from the repository
                var sucesso = await _transportadoraRepo.Delete(id);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao excluir transportadora" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir transportadora", erro = ex.Message });
            }
        }
    }
}