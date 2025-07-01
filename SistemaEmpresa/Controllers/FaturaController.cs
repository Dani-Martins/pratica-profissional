using Microsoft.AspNetCore.Mvc;
using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class FaturaController : ControllerBase
    {
        private readonly FaturaRepository _faturaRepo;
        private readonly NFERepository _nfeRepo;

        public FaturaController(
            FaturaRepository faturaRepo,
            NFERepository nfeRepo)
        {
            _faturaRepo = faturaRepo;
            _nfeRepo = nfeRepo;
        }

        /// <summary>
        /// Lista todas as faturas
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Fatura>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Fatura>>> Get()
        {
            try
            {
                var faturas = await _faturaRepo.ReadAll();
                return Ok(faturas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar faturas", erro = ex.Message });
            }
        }

        /// <summary>
        /// Obtém uma fatura pelo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Fatura), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Fatura>> GetById(long id)
        {
            try
            {
                var fatura = await _faturaRepo.ReadById(id);
                if (fatura == null)
                    return NotFound(new { mensagem = $"Fatura com ID {id} não encontrada" });

                return Ok(fatura);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar fatura", erro = ex.Message });
            }
        }

        /// <summary>
        /// Lista todas as faturas de uma NFE específica
        /// </summary>
        [HttpGet("nfe/{nfeId}")]
        [ProducesResponseType(typeof(IEnumerable<Fatura>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<Fatura>>> GetByNFE(long nfeId)
        {
            try
            {
                var nfe = await _nfeRepo.ReadById(nfeId);
                if (nfe == null)
                    return NotFound(new { mensagem = $"NFE com ID {nfeId} não encontrada" });

                var faturas = await _faturaRepo.ReadByNFE(nfeId);
                return Ok(faturas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar faturas da NFE", erro = ex.Message });
            }
        }

        /// <summary>
        /// Cadastra uma nova fatura
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(Fatura), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Fatura>> Post([FromBody] Fatura fatura)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Validar existência da NFE
                var nfe = await _nfeRepo.ReadById(fatura.NfeId);
                if (nfe == null)
                    return BadRequest(new { mensagem = $"NFE com ID {fatura.NfeId} não encontrada" });

                var sucesso = await _faturaRepo.Create(fatura);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao criar fatura" });

                return CreatedAtAction(nameof(GetById), new { id = fatura.Id }, fatura);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar fatura", erro = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza uma fatura existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(Fatura), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Fatura>> Put(long id, [FromBody] Fatura fatura)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var faturaExistente = await _faturaRepo.ReadById(id);
                if (faturaExistente == null)
                    return NotFound(new { mensagem = $"Fatura com ID {id} não encontrada" });

                // Validar existência da NFE
                var nfe = await _nfeRepo.ReadById(fatura.NfeId);
                if (nfe == null)
                    return BadRequest(new { mensagem = $"NFE com ID {fatura.NfeId} não encontrada" });

                var sucesso = await _faturaRepo.Update(id, fatura);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao atualizar fatura" });

                return Ok(fatura);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar fatura", erro = ex.Message });
            }
        }

        /// <summary>
        /// Remove uma fatura
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(long id)
        {
            try
            {
                var fatura = await _faturaRepo.ReadById(id);
                if (fatura == null)
                    return NotFound(new { mensagem = $"Fatura com ID {id} não encontrada" });

                var sucesso = await _faturaRepo.Delete(id);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao excluir fatura" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir fatura", erro = ex.Message });
            }
        }
    }
}