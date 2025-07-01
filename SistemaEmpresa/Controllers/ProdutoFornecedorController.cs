using Microsoft.AspNetCore.Mvc;
using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class ProdutoFornecedorController : ControllerBase
    {
        private readonly ProdutoFornecedorRepository _produtoFornecedorRepo;
        private readonly ProdutoRepository _produtoRepo;
        private readonly FornecedorRepository _fornecedorRepo;

        public ProdutoFornecedorController(
            ProdutoFornecedorRepository produtoFornecedorRepo,
            ProdutoRepository produtoRepo,
            FornecedorRepository fornecedorRepo)
        {
            _produtoFornecedorRepo = produtoFornecedorRepo;
            _produtoRepo = produtoRepo;
            _fornecedorRepo = fornecedorRepo;
        }

        /// <summary>
        /// Lista todos os produtos por fornecedor ativos
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProdutoFornecedor>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<ProdutoFornecedor>>> Get()
        {
            try
            {
                var produtos = await _produtoFornecedorRepo.ReadAll();
                return Ok(produtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar produtos por fornecedor", erro = ex.Message });
            }
        }

        /// <summary>
        /// Obtém um produto por fornecedor pelo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProdutoFornecedor), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ProdutoFornecedor>> GetById(long id)
        {
            try
            {
                var produto = await _produtoFornecedorRepo.ReadById(id);
                if (produto == null)
                    return NotFound(new { mensagem = $"Produto por fornecedor com ID {id} não encontrado" });

                return Ok(produto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar produto por fornecedor", erro = ex.Message });
            }
        }

        /// <summary>
        /// Cadastra um novo produto por fornecedor
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ProdutoFornecedor), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ProdutoFornecedor>> Post([FromBody] ProdutoFornecedor produtoFornecedor)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Validar existência do Produto
                var produto = await _produtoRepo.ReadById(produtoFornecedor.ProdutoId);
                if (produto == null)
                    return BadRequest(new { mensagem = $"Produto com ID {produtoFornecedor.ProdutoId} não encontrado" });

                // Validar existência do Fornecedor
                var fornecedor = await _fornecedorRepo.ReadById(produtoFornecedor.FornecedorId);
                if (fornecedor == null)
                    return BadRequest(new { mensagem = $"Fornecedor com ID {produtoFornecedor.FornecedorId} não encontrado" });

                var sucesso = await _produtoFornecedorRepo.Create(produtoFornecedor);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao criar produto por fornecedor" });

                return CreatedAtAction(nameof(GetById), new { id = produtoFornecedor.Id }, produtoFornecedor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar produto por fornecedor", erro = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza um produto por fornecedor existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ProdutoFornecedor), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ProdutoFornecedor>> Put(long id, [FromBody] ProdutoFornecedor produtoFornecedor)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var produtoExistente = await _produtoFornecedorRepo.ReadById(id);
                if (produtoExistente == null)
                    return NotFound(new { mensagem = $"Produto por fornecedor com ID {id} não encontrado" });

                // Validar existência do Produto
                var produto = await _produtoRepo.ReadById(produtoFornecedor.ProdutoId);
                if (produto == null)
                    return BadRequest(new { mensagem = $"Produto com ID {produtoFornecedor.ProdutoId} não encontrado" });

                // Validar existência do Fornecedor
                var fornecedor = await _fornecedorRepo.ReadById(produtoFornecedor.FornecedorId);
                if (fornecedor == null)
                    return BadRequest(new { mensagem = $"Fornecedor com ID {produtoFornecedor.FornecedorId} não encontrado" });

                var sucesso = await _produtoFornecedorRepo.Update(id, produtoFornecedor);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao atualizar produto por fornecedor" });

                return Ok(produtoFornecedor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar produto por fornecedor", erro = ex.Message });
            }
        }

        /// <summary>
        /// Remove um produto por fornecedor
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(long id)
        {
            try
            {
                var produto = await _produtoFornecedorRepo.ReadById(id);
                if (produto == null)
                    return NotFound(new { mensagem = $"Produto por fornecedor com ID {id} não encontrado" });

                var sucesso = await _produtoFornecedorRepo.Delete(id);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao excluir produto por fornecedor" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir produto por fornecedor", erro = ex.Message });
            }
        }
    }
}