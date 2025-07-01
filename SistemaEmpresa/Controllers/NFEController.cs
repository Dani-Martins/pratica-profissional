using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class NFEController : ControllerBase
    {
        private readonly NFERepository _nfeRepo;
        private readonly ItemNFERepository _itemRepo;
        private readonly FaturaRepository _faturaRepo;

        public NFEController(
            NFERepository nfeRepo,
            ItemNFERepository itemRepo,
            FaturaRepository faturaRepo)
        {
            _nfeRepo = nfeRepo;
            _itemRepo = itemRepo;
            _faturaRepo = faturaRepo;
        }

        /// <summary>
        /// Obtém todas as NFEs cadastradas
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<NFE>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<NFE>>> Get()
        {
            try
            {
                var nfes = await _nfeRepo.ReadAll();
                return Ok(nfes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar NFEs", erro = ex.Message });
            }
        }

        /// <summary>
        /// Obtém uma NFE pelo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(NFE), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<NFE>> GetById(long id)
        {
            try
            {
                var nfe = await _nfeRepo.ReadById(id);
                if (nfe == null)
                    return NotFound(new { mensagem = $"NFE com ID {id} não encontrada" });

                // Carregar dados relacionados
                var itens = await _itemRepo.ReadByNFE(nfe.Id);
                var faturas = await _faturaRepo.ReadByNFE(nfe.Id);

                nfe.Itens = itens;
                nfe.Faturas = faturas;

                return Ok(nfe);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar NFE", erro = ex.Message });
            }
        }

        /// <summary>
        /// Cadastra uma nova NFE
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(NFE), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<NFE>> Post([FromBody] NFE nfe)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Criar NFE
                var sucesso = await _nfeRepo.Create(nfe);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao criar NFE" });

                // Criar itens
                if (nfe.Itens != null)
                {
                    foreach (var item in nfe.Itens)
                    {
                        item.NfeId = nfe.Id;
                        await _itemRepo.Create(item);
                    }
                }

                // Criar faturas
                if (nfe.Faturas != null)
                {
                    foreach (var fatura in nfe.Faturas)
                    {
                        fatura.NfeId = nfe.Id;
                        await _faturaRepo.Create(fatura);
                    }
                }

                return CreatedAtAction(nameof(GetById), new { id = nfe.Id }, nfe);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar NFE", erro = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza uma NFE existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(NFE), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<NFE>> Put(long id, [FromBody] NFE nfe)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var nfeExistente = await _nfeRepo.ReadById(id);
                if (nfeExistente == null)
                    return NotFound(new { mensagem = $"NFE com ID {id} não encontrada" });

                // Atualizar NFE
                var sucesso = await _nfeRepo.Update(id, nfe);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao atualizar NFE" });

                // Atualizar itens
                if (nfe.Itens != null)
                {
                    // Remover itens existentes
                    var itensAtuais = await _itemRepo.ReadByNFE(id);
                    foreach (var item in itensAtuais)
                    {
                        await _itemRepo.Delete(item.Id);
                    }

                    // Criar novos itens
                    foreach (var item in nfe.Itens)
                    {
                        item.NfeId = id;
                        await _itemRepo.Create(item);
                    }
                }
                // Atualizar faturas
                if (nfe.Faturas != null)
                {
                    // Remover faturas existentes
                    var faturasAtuais = await _faturaRepo.ReadByNFE(id);
                    foreach (var fatura in faturasAtuais)
                    {
                        await _faturaRepo.Delete(fatura.Id);
                    }

                    // Criar novas faturas
                    foreach (var fatura in nfe.Faturas)
                    {
                        fatura.NfeId = id;
                        await _faturaRepo.Create(fatura);
                    }
                }

                return Ok(nfe);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar NFE", erro = ex.Message });
            }
        }

        /// <summary>
        /// Remove uma NFE
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(long id)
        {
            try
            {
                var nfe = await _nfeRepo.ReadById(id);
                if (nfe == null)
                    return NotFound(new { mensagem = $"NFE com ID {id} não encontrada" });

                // Excluir itens
                var itens = await _itemRepo.ReadByNFE(id);
                foreach (var item in itens)
                {
                    await _itemRepo.Delete(item.Id);
                }

                // Excluir faturas
                var faturas = await _faturaRepo.ReadByNFE(id);
                foreach (var fatura in faturas)
                {
                    await _faturaRepo.Delete(fatura.Id);
                }

                // Excluir NFE
                var sucesso = await _nfeRepo.Delete(id);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao excluir NFE" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir NFE", erro = ex.Message });
            }
        }
    }
}