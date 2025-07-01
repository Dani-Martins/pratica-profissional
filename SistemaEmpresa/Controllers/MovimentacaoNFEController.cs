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
    public class MovimentacaoNFEController : ControllerBase
    {
        private readonly MovimentacaoNFERepository _movimentacaoRepo;
        private readonly NFERepository _nfeRepo;

        public MovimentacaoNFEController(
            MovimentacaoNFERepository movimentacaoRepo,
            NFERepository nfeRepo)
        {
            _movimentacaoRepo = movimentacaoRepo;
            _nfeRepo = nfeRepo;
        }

        /// <summary>
        /// Lista todas as movimentações
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<MovimentacaoNFEDTO>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<MovimentacaoNFEDTO>>> Get()
        {
            try
            {
                var movimentacoes = await _movimentacaoRepo.ReadAll();
                return Ok(movimentacoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar movimentações", erro = ex.Message });
            }
        }

        /// <summary>
        /// Obtém uma movimentação pelo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(MovimentacaoNFEDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MovimentacaoNFEDTO>> GetById(long id)
        {
            try
            {
                var movimentacao = await _movimentacaoRepo.ReadById(id);
                if (movimentacao == null)
                    return NotFound(new { mensagem = $"Movimentação com ID {id} não encontrada" });

                return Ok(movimentacao);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao obter movimentação", erro = ex.Message });
            }
        }

        /// <summary>
        /// Lista movimentações de uma NFE
        /// </summary>
        [HttpGet("nfe/{nfeId}")]
        [ProducesResponseType(typeof(IEnumerable<MovimentacaoNFEDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<MovimentacaoNFEDTO>>> GetByNFE(long nfeId)
        {
            try
            {
                var nfe = await _nfeRepo.ReadById(nfeId);
                if (nfe == null)
                    return NotFound(new { mensagem = $"NFE com ID {nfeId} não encontrada" });

                var movimentacoes = await _movimentacaoRepo.ReadByNFE(nfeId);
                return Ok(movimentacoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar movimentações", erro = ex.Message });
            }
        }

        /// <summary>
        /// Cria uma nova movimentação
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(MovimentacaoNFEDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<MovimentacaoNFEDTO>> Post([FromBody] CreateMovimentacaoNFEDTO movimentacaoDTO)
        {
            try
            {
                var nfe = await _nfeRepo.ReadById(movimentacaoDTO.NfeId);
                if (nfe == null)
                    return BadRequest(new { mensagem = $"NFE com ID {movimentacaoDTO.NfeId} não encontrada" });

                var movimentacao = new MovimentacaoNFE
                {
                    NfeId = movimentacaoDTO.NfeId,
                    DataMovimentacao = movimentacaoDTO.DataMovimentacao,
                    Status = movimentacaoDTO.Status,
                    Descricao = movimentacaoDTO.Descricao
                };

                var id = await _movimentacaoRepo.Create(movimentacao);
                movimentacao.Id = id;

                return CreatedAtAction(nameof(GetById), new { id }, movimentacao);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar movimentação", erro = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza uma movimentação
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Put(long id, [FromBody] UpdateMovimentacaoNFEDTO movimentacaoDTO)
        {
            try
            {
                var movimentacaoExistente = await _movimentacaoRepo.ReadById(id);
                if (movimentacaoExistente == null)
                    return NotFound(new { mensagem = $"Movimentação com ID {id} não encontrada" });

                var nfe = await _nfeRepo.ReadById(movimentacaoDTO.NfeId);
                if (nfe == null)
                    return BadRequest(new { mensagem = $"NFE com ID {movimentacaoDTO.NfeId} não encontrada" });

                var movimentacao = new MovimentacaoNFE
                {
                    Id = id,
                    NfeId = movimentacaoDTO.NfeId,
                    DataMovimentacao = movimentacaoDTO.DataMovimentacao,
                    Status = movimentacaoDTO.Status,
                    Descricao = movimentacaoDTO.Descricao
                };

                var sucesso = await _movimentacaoRepo.Update(movimentacao);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao atualizar movimentação" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar movimentação", erro = ex.Message });
            }
        }

        /// <summary>
        /// Remove uma movimentação
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(long id)
        {
            try
            {
                var movimentacao = await _movimentacaoRepo.ReadById(id);
                if (movimentacao == null)
                    return NotFound(new { mensagem = $"Movimentação com ID {id} não encontrada" });

                var sucesso = await _movimentacaoRepo.Delete(id);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao excluir movimentação" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir movimentação", erro = ex.Message });
            }
        }
    }
}