using Microsoft.AspNetCore.Mvc;
using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class ItemNFEController : ControllerBase
    {
        private readonly ItemNFERepository _itemRepo;
        private readonly NFERepository _nfeRepo;
        private readonly ProdutoRepository _produtoRepo;

        public ItemNFEController(
            ItemNFERepository itemRepo,
            NFERepository nfeRepo,
            ProdutoRepository produtoRepo)
        {
            _itemRepo = itemRepo;
            _nfeRepo = nfeRepo;
            _produtoRepo = produtoRepo;
        }

        /// <summary>
        /// Lista todos os itens de NFE
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ItemNFE>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<ItemNFE>>> Get()
        {
            try
            {
                var itens = await _itemRepo.ReadAll();
                return Ok(itens);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar itens", erro = ex.Message });
            }
        }

        /// <summary>
        /// Obtém um item de NFE pelo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ItemNFE), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ItemNFE>> GetById(long id)
        {
            try
            {
                var item = await _itemRepo.ReadById(id);
                if (item == null)
                    return NotFound(new { mensagem = $"Item com ID {id} não encontrado" });

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar item", erro = ex.Message });
            }
        }

        /// <summary>
        /// Lista todos os itens de uma NFE específica
        /// </summary>
        [HttpGet("nfe/{nfeId}")]
        [ProducesResponseType(typeof(IEnumerable<ItemNFE>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<ItemNFE>>> GetByNFE(long nfeId)
        {
            try
            {
                var nfe = await _nfeRepo.ReadById(nfeId);
                if (nfe == null)
                    return NotFound(new { mensagem = $"NFE com ID {nfeId} não encontrada" });

                var itens = await _itemRepo.ReadByNFE(nfeId);
                return Ok(itens);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar itens da NFE", erro = ex.Message });
            }
        }

        /// <summary>
        /// Cadastra um novo item de NFE
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ItemNFE), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ItemNFE>> Post([FromBody] ItemNFE item)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Validar existência da NFE
                var nfe = await _nfeRepo.ReadById(item.NfeId);
                if (nfe == null)
                    return BadRequest(new { mensagem = $"NFE com ID {item.NfeId} não encontrada" });

                // Validar existência do Produto
                var produto = await _produtoRepo.ReadById(item.ProdutoId);
                if (produto == null)
                    return BadRequest(new { mensagem = $"Produto com ID {item.ProdutoId} não encontrado" });

                var sucesso = await _itemRepo.Create(item);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao criar item" });

                return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar item", erro = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza um item de NFE existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ItemNFE), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ItemNFE>> Put(long id, [FromBody] ItemNFE item)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var itemExistente = await _itemRepo.ReadById(id);
                if (itemExistente == null)
                    return NotFound(new { mensagem = $"Item com ID {id} não encontrado" });

                // Validar existência da NFE
                var nfe = await _nfeRepo.ReadById(item.NfeId);
                if (nfe == null)
                    return BadRequest(new { mensagem = $"NFE com ID {item.NfeId} não encontrada" });

                // Validar existência do Produto
                var produto = await _produtoRepo.ReadById(item.ProdutoId);
                if (produto == null)
                    return BadRequest(new { mensagem = $"Produto com ID {item.ProdutoId} não encontrado" });

                var sucesso = await _itemRepo.Update(id, item);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao atualizar item" });

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar item", erro = ex.Message });
            }
        }

        /// <summary>
        /// Remove um item de NFE
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(long id)
        {
            try
            {
                var item = await _itemRepo.ReadById(id);
                if (item == null)
                    return NotFound(new { mensagem = $"Item com ID {id} não encontrado" });

                var sucesso = await _itemRepo.Delete(id);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao excluir item" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir item", erro = ex.Message });
            }
        }
    }
}
