using Microsoft.AspNetCore.Mvc;
using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class TranspItemController : ControllerBase
    {
        private readonly TranspItemRepository _transpItemRepo;
        private readonly TransportadoraRepository _transportadoraRepo;

        public TranspItemController(
            TranspItemRepository transpItemRepo,
            TransportadoraRepository transportadoraRepo)
        {
            _transpItemRepo = transpItemRepo;
            _transportadoraRepo = transportadoraRepo;
        }

        /// <summary>
        /// Lista todos os itens de transporte ativos
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<TranspItem>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<TranspItem>>> Get()
        {
            try
            {
                var items = await _transpItemRepo.ReadAll();
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar itens de transporte", erro = ex.Message });
            }
        }

        /// <summary>
        /// Obtém um item de transporte pelo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(TranspItem), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TranspItem>> GetById(long id)
        {
            try
            {
                var item = await _transpItemRepo.ReadById(id);
                if (item == null)
                    return NotFound(new { mensagem = $"Item de transporte com ID {id} não encontrado" });

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar item de transporte", erro = ex.Message });
            }
        }

        /// <summary>
        /// Cadastra um novo item de transporte
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(TranspItem), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<TranspItem>> Post([FromBody] TranspItem item)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                if (item.TransportadoraId.HasValue)
                {
                    var transportadora = await _transportadoraRepo.ReadById(item.TransportadoraId.Value);
                    if (transportadora == null)
                        return BadRequest(new { mensagem = $"Transportadora com ID {item.TransportadoraId} não encontrada" });
                }

                var sucesso = await _transpItemRepo.Create(item);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao criar item de transporte" });

                return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar item de transporte", erro = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza um item de transporte existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(TranspItem), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TranspItem>> Put(long id, [FromBody] TranspItem item)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var itemExistente = await _transpItemRepo.ReadById(id);
                if (itemExistente == null)
                    return NotFound(new { mensagem = $"Item de transporte com ID {id} não encontrado" });

                if (item.TransportadoraId.HasValue)
                {
                    var transportadora = await _transportadoraRepo.ReadById(item.TransportadoraId.Value);
                    if (transportadora == null)
                        return BadRequest(new { mensagem = $"Transportadora com ID {item.TransportadoraId} não encontrada" });
                }

                var sucesso = await _transpItemRepo.Update(id, item);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao atualizar item de transporte" });

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar item de transporte", erro = ex.Message });
            }
        }

        /// <summary>
        /// Remove um item de transporte
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(long id)
        {
            try
            {
                var item = await _transpItemRepo.ReadById(id);
                if (item == null)
                    return NotFound(new { mensagem = $"Item de transporte com ID {id} não encontrado" });

                var sucesso = await _transpItemRepo.Delete(id);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao excluir item de transporte" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir item de transporte", erro = ex.Message });
            }
        }
    }
}