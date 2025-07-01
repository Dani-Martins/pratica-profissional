using Microsoft.AspNetCore.Mvc;
using SistemaEmpresa.Models;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class PaisController : ControllerBase
    {
        private readonly PaisService _service;

        public PaisController(PaisService service)
        {
            _service = service;
        }

        /// <summary>
        /// Obtém todos os países cadastrados
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            Console.WriteLine("Recebida requisição GET em /api/Pais");
            try
            {
                var paises = await _service.GetAll();
                Console.WriteLine($"Retornando {paises.Count} países");
                return Ok(paises);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em GetAll: {ex.Message}");
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }        /// <summary>
        /// Obtém um país pelo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                Console.WriteLine($"Buscando país com ID {id}");
                var pais = await _service.GetById(id);
                
                // Log para verificar os valores retornados
                Console.WriteLine($"País encontrado: ID={pais.Id}, Nome={pais.Nome}, Situacao={pais.Situacao}");
                
                return Ok(pais);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar país ID {id}: {ex.Message}");
                return NotFound(ex.Message);
            }
        }

        /// <summary>
        /// Cadastra um novo país
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PaisDTO>> Create([FromBody] PaisCreateDTO dto)
        {
            // Adicionar logs para debug
            Console.WriteLine($"Recebendo dados: Nome={dto.Nome}, Codigo={dto.Codigo}, Sigla={dto.Sigla}");
            
            if (!ModelState.IsValid)
            {
                // Logar detalhes do erro de validação
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    Console.WriteLine($"Erro de validação: {error.ErrorMessage}");
                }
                return BadRequest(ModelState);
            }

            var paisCriado = await _service.Create(dto);
            if (paisCriado == null)
                return BadRequest(new { message = "Não foi possível criar o país" });
    
            return CreatedAtAction(nameof(Get), new { id = paisCriado.Id }, paisCriado);
        }

        /// <summary>
        /// Atualiza um país existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Put(int id, [FromBody] PaisUpdateDTO paisDto)
        {
            try
            {                // Criar objeto Pais apenas com os dados do DTO + ID da rota
                Console.WriteLine($"PUT para país ID {id}");
                Console.WriteLine($"Dados recebidos: Nome={paisDto.Nome}, Situacao={paisDto.Situacao}");
                
                var pais = new Pais
                {
                    Id = id, // ID vem APENAS da rota, não do corpo
                    Nome = paisDto.Nome,
                    Codigo = paisDto.Codigo ?? string.Empty, // Fornece valor padrão caso seja nulo
                    Sigla = paisDto.Sigla ?? string.Empty, // Fornece valor padrão caso seja nulo
                    Situacao = paisDto.Situacao, // Garantir que a situação seja incluída
                    DataAlteracao = DateTime.Now,
                    UserAlteracao = paisDto.UserAlteracao ?? "SISTEMA"
                };
                  var updatedPais = await _service.UpdateAsync(pais);
                Console.WriteLine($"País atualizado: Id={updatedPais.Id}, Nome={updatedPais.Nome}, Situacao={updatedPais.Situacao}");
                return Ok(updatedPais);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }        /// <summary>
        /// Desativa um país (altera situação para inativo)
        /// </summary>
        [HttpDelete("{id}")]        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                Console.WriteLine($"Excluindo país ID {id}");
                
                // Buscar o país primeiro
                var pais = await _service.GetById(id);
                if (pais == null)
                {
                    return NotFound($"País com ID {id} não encontrado");
                }
                
                // Chamar o método Delete no repositório que internamente marca como inativo
                await _service.DeleteAsync(id);
                
                Console.WriteLine($"País ID {id} marcado como inativo com sucesso");
                
                // Buscar o país atualizado para retornar
                var paisAtualizado = await _service.GetById(id);
                
                return Ok(paisAtualizado);
            }
            catch (Exception ex)
            {                Console.WriteLine($"Erro ao desativar país: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("ExcluirForcado/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ExcluirForcado(long id)
        {
            try
            {                // Verificar se o país existe
                var pais = await _service.GetById((int)id);
                if (pais == null)
                {
                    return NotFound(new { mensagem = $"País com ID {id} não encontrado." });
                }
                  // Implementar exclusão forçada
                await _service.DeleteAsync((int)id);
                
                return Ok(new { mensagem = "País excluído com sucesso (modo forçado)." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = $"Erro ao excluir país: {ex.Message}" });
            }
        }        /// <summary>
        /// Reativa um país que foi marcado como inativo
        /// </summary>
        [HttpPost("{id}/reativar")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Reativar(int id)
        {
            try
            {
                Console.WriteLine($"Reativando país ID {id}");
                
                // Buscar o país primeiro
                var pais = await _service.GetById(id);
                if (pais == null)
                {
                    return NotFound($"País com ID {id} não encontrado");
                }
                
                // Alterar a situação para ativo
                pais.Situacao = 1;
                pais.DataAlteracao = DateTime.Now;
                pais.UserAlteracao = "SISTEMA";
                
                Console.WriteLine($"Atualizando país para ativo: ID={pais.Id}, Nome={pais.Nome}, Situacao={pais.Situacao}");
                
                // Usar PUT normal para atualizar
                var paisDto = new PaisUpdateDTO
                {
                    Nome = pais.Nome,
                    Sigla = pais.Sigla,
                    Codigo = pais.Codigo,
                    Situacao = 1,
                    UserAlteracao = "SISTEMA"
                };
                
                return await Put(id, paisDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao reativar país: {ex.Message}");
                return StatusCode(500, ex.Message);
            }
        }
    }
}