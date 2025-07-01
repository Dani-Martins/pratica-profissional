using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Models;
using SistemaEmpresa.Services;
using SistemaEmpresa.Data;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.EntityFrameworkCore;
using System.Linq; // Adicione esta linha para resolver o erro com Any()
using MySqlConnector;

namespace SistemaEmpresa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]    public class ClienteController : ControllerBase
    {
        private readonly ClienteService _clienteService;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        // Modificar o construtor para receber o contexto e configuração
        public ClienteController(ClienteService clienteService, ApplicationDbContext context, IConfiguration configuration)
        {
            _clienteService = clienteService;
            _context = context;
            _configuration = configuration;
        }// GET: api/Cliente
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetClientes()
        {
            try
            {
                Console.WriteLine("[ClienteController.GetClientes] Iniciando busca de todos os clientes");
                
                // Use o serviço em vez de acessar o contexto diretamente
                var clientes = await _clienteService.GetAllAsync();
                
                Console.WriteLine($"[ClienteController.GetClientes] Número de clientes recuperados do serviço: {clientes.Count}");
                
                var clientesResponse = new List<object>();
                  foreach (var c in clientes)
                {
                    try
                    {
                        Console.WriteLine($"[ClienteController.GetClientes] Processando cliente ID {c.Id}, DataCriacao={c.DataCriacao}, DataAlteracao={c.DataAlteracao}");
                        
                        var clienteObj = new 
                        {
                            id = c.Id,
                            tipoPessoa = c.TipoPessoa ?? string.Empty,
                            nome = c.Nome ?? string.Empty,
                            cpf = c.CPF ?? string.Empty,
                            razaoSocial = c.RazaoSocial ?? string.Empty,
                            nomeFantasia = c.NomeFantasia ?? string.Empty,
                            cnpj = c.CNPJ ?? string.Empty,
                            inscricaoEstadual = c.InscricaoEstadual ?? string.Empty,
                            email = c.Email ?? string.Empty,
                            telefone = c.Telefone ?? string.Empty,
                            endereco = c.Endereco ?? string.Empty,
                            numero = c.Numero ?? string.Empty,
                            complemento = c.Complemento ?? string.Empty,
                            bairro = c.Bairro ?? string.Empty,
                            cep = c.CEP ?? string.Empty,
                            cidadeId = c.CidadeId,
                            ativo = c.Ativo,
                            // Objetos relacionados com verificação de nulos
                            cidade = c.Cidade != null ? new { id = c.Cidade.Id, nome = c.Cidade.Nome ?? string.Empty } : null,
                            condicaoPagamento = c.CondicaoPagamento != null ? new { id = c.CondicaoPagamento.Id, descricao = c.CondicaoPagamento.Descricao ?? string.Empty } : null,
                            // Campos de auditoria com verificação adicional
                            dataCriacao = c.DataCriacao ?? DateTime.Now,
                            dataAlteracao = c.DataAlteracao,
                            userCriacao = c.UserCriacao ?? string.Empty,
                            userAtualizacao = c.UserAtualizacao ?? string.Empty,
                            // Outros campos
                            apelido = c.Apelido ?? string.Empty,
                            isBrasileiro = c.IsBrasileiro ?? false,
                            limiteCredito = c.LimiteCredito ?? 0,
                            nacionalidade = c.Nacionalidade ?? string.Empty,
                            rg = c.RG ?? string.Empty,
                            dataNascimento = c.DataNascimento,
                            estadoCivil = c.EstadoCivil ?? string.Empty,
                            sexo = c.Sexo ?? string.Empty,
                            condicaoPagamentoId = c.CondicaoPagamentoId,
                            limiteCredito2 = c.LimiteCredito2 ?? 0,
                            observacao = c.Observacao ?? string.Empty
                        };
                        
                        clientesResponse.Add(clienteObj);
                    }
                    catch (Exception itemEx)
                    {
                        Console.WriteLine($"[ClienteController.GetClientes] ERRO ao processar cliente ID {c.Id}: {itemEx.Message}");
                    }
                }
                
                Console.WriteLine($"[ClienteController.GetClientes] Clientes processados com sucesso: {clientesResponse.Count}");
                
                // Log para depuração
                if (clientesResponse.Any())
                {
                    Console.WriteLine($"[ClienteController.GetClientes] Exemplo do primeiro cliente convertido: {System.Text.Json.JsonSerializer.Serialize(clientesResponse.First())}");
                }
                
                return Ok(clientesResponse);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClienteController.GetClientes] ERRO: {ex.GetType().Name}: {ex.Message}");
                Console.WriteLine($"[ClienteController.GetClientes] StackTrace: {ex.StackTrace}");
                
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[ClienteController.GetClientes] InnerException: {ex.InnerException.Message}");
                }
                  return StatusCode(StatusCodes.Status500InternalServerError, new { mensagem = "Erro interno ao buscar clientes", erro = ex.Message });
            }
        }

        // GET: api/Cliente/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetCliente(long id)
        {
            try
            {
                Console.WriteLine($"[ClienteController.GetCliente] Buscando cliente ID: {id}");
                
                // Buscar o cliente completo usando o serviço
                var cliente = await _clienteService.GetByIdAsync(id);
                
                if (cliente == null)
                {
                    Console.WriteLine($"[ClienteController.GetCliente] Cliente ID {id} não encontrado");
                    return NotFound($"Cliente com ID {id} não encontrado");
                }
                
                // Criar DTO com os nomes de campos em camelCase e tratando valores nulos
                var clienteDTO = new {
                    id = cliente.Id,
                    tipoPessoa = cliente.TipoPessoa ?? string.Empty,
                    nome = cliente.Nome ?? string.Empty,
                    cpf = cliente.CPF ?? string.Empty,
                    razaoSocial = cliente.RazaoSocial ?? string.Empty,
                    nomeFantasia = cliente.NomeFantasia ?? string.Empty,
                    cnpj = cliente.CNPJ ?? string.Empty,
                    inscricaoEstadual = cliente.InscricaoEstadual ?? string.Empty,
                    email = cliente.Email ?? string.Empty,
                    telefone = cliente.Telefone ?? string.Empty,
                    endereco = cliente.Endereco ?? string.Empty,
                    numero = cliente.Numero ?? string.Empty,
                    complemento = cliente.Complemento ?? string.Empty,
                    bairro = cliente.Bairro ?? string.Empty,                    cep = cliente.CEP ?? string.Empty,
                    cidadeId = cliente.CidadeId,
                    ativo = cliente.Ativo,
                    // Campos de auditoria - garantir que estejam explicitamente em camelCase
                    dataCriacao = cliente.DataCriacao ?? DateTime.Now,
                    dataAlteracao = cliente.DataAlteracao,
                    userCriacao = cliente.UserCriacao ?? string.Empty,
                    userAtualizacao = cliente.UserAtualizacao ?? string.Empty,
                    // Outros campos
                    apelido = cliente.Apelido ?? string.Empty,
                    isBrasileiro = cliente.IsBrasileiro ?? false,
                    limiteCredito = cliente.LimiteCredito ?? 0,
                    nacionalidade = cliente.Nacionalidade ?? string.Empty,
                    rg = cliente.RG ?? string.Empty,
                    dataNascimento = cliente.DataNascimento,
                    estadoCivil = cliente.EstadoCivil ?? string.Empty,
                    sexo = cliente.Sexo ?? string.Empty,
                    condicaoPagamentoId = cliente.CondicaoPagamentoId,
                    limiteCredito2 = cliente.LimiteCredito2 ?? 0,
                    observacao = cliente.Observacao ?? string.Empty,
                    // Incluir objetos relacionados
                    cidade = cliente.Cidade != null ? new { 
                        id = cliente.Cidade.Id, 
                        nome = cliente.Cidade.Nome ?? string.Empty 
                    } : null,
                    condicaoPagamento = cliente.CondicaoPagamento != null ? new { 
                        id = cliente.CondicaoPagamento.Id, 
                        descricao = cliente.CondicaoPagamento.Descricao ?? string.Empty 
                    } : null
                };
                
                // Log para depuração
                Console.WriteLine($"[ClienteController.GetCliente] Cliente ID {id} encontrado. Convertido para DTO: {System.Text.Json.JsonSerializer.Serialize(clienteDTO)}");
                
                return Ok(clienteDTO);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClienteController.GetCliente] ERRO: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[ClienteController.GetCliente] InnerException: {ex.InnerException.Message}");
                
                return StatusCode(500, new { mensagem = $"Erro interno ao buscar cliente", erro = ex.Message });
            }
        }

        [HttpGet("nome/{nome}")]
        [ProducesResponseType(typeof(IEnumerable<Cliente>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetByName(string nome)
        {
            try
            {
                var clientes = await _clienteService.GetByNameAsync(nome);
                return Ok(clientes.ToArray()); // Correto: chama o método ToArray()
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar clientes por nome", erro = ex.Message });
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(ClienteDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ClienteDTO>> Create([FromBody] ClienteCreateDTO clienteCreate)
        {
            try
            {                // Converta de ClienteCreateDTO para Cliente
                var cliente = new Cliente
                {
                    TipoPessoa = clienteCreate.TipoPessoa,
                    Nome = clienteCreate.Nome,
                    RazaoSocial = string.IsNullOrWhiteSpace(clienteCreate.RazaoSocial) ? null : clienteCreate.RazaoSocial,
                    NomeFantasia = clienteCreate.NomeFantasia,
                    InscricaoEstadual = clienteCreate.InscricaoEstadual,
                    CPF = clienteCreate.CPF,
                    CNPJ = clienteCreate.CNPJ,
                    Email = clienteCreate.Email,
                    Telefone = clienteCreate.Telefone,
                    Endereco = clienteCreate.Endereco, 
                    Numero = clienteCreate.Numero,
                    Complemento = clienteCreate.Complemento,
                    Bairro = clienteCreate.Bairro,
                    CEP = clienteCreate.CEP,
                    CidadeId = clienteCreate.CidadeId,
                    Ativo = clienteCreate.Ativo,
                    
                    // Novos campos
                    Apelido = clienteCreate.Apelido,
                    IsBrasileiro = clienteCreate.IsBrasileiro,
                    LimiteCredito = clienteCreate.LimiteCredito,
                    Nacionalidade = clienteCreate.Nacionalidade,
                    RG = clienteCreate.RG,
                    DataNascimento = clienteCreate.DataNascimento,
                    EstadoCivil = clienteCreate.EstadoCivil,
                    Sexo = clienteCreate.Sexo,
                    CondicaoPagamentoId = clienteCreate.CondicaoPagamentoId,
                    LimiteCredito2 = clienteCreate.LimiteCredito2,
                    Observacao = clienteCreate.Observacao,
                    DataCriacao = DateTime.Now,
                    UserCriacao = User.Identity?.Name ?? "sistema"
                };
                
                // LINHA CORRIGIDA: Usar CreateAsync em vez de SaveAsync
                var clienteCriado = await _clienteService.CreateAsync(cliente);
                  // Converta de Cliente para ClienteDTO para a resposta
                var clienteDTO = new ClienteDTO
                {
                    Id = clienteCriado.Id,
                    TipoPessoa = clienteCriado.TipoPessoa,
                    Nome = clienteCriado.Nome,
                    RazaoSocial = clienteCriado.RazaoSocial,
                    NomeFantasia = clienteCriado.NomeFantasia,
                    CPF = clienteCriado.CPF,
                    CNPJ = clienteCriado.CNPJ,
                    InscricaoEstadual = clienteCriado.InscricaoEstadual,
                    Email = clienteCriado.Email,
                    Telefone = clienteCriado.Telefone,
                    Endereco = clienteCriado.Endereco,
                    Numero = clienteCriado.Numero,
                    Complemento = clienteCriado.Complemento,
                    Bairro = clienteCriado.Bairro,
                    CEP = clienteCriado.CEP,
                    CidadeId = clienteCriado.CidadeId,
                    Ativo = clienteCriado.Ativo,

                    // Novos campos
                    Apelido = clienteCriado.Apelido,
                    IsBrasileiro = clienteCriado.IsBrasileiro,
                    LimiteCredito = clienteCriado.LimiteCredito,
                    Nacionalidade = clienteCriado.Nacionalidade,
                    RG = clienteCriado.RG,
                    DataNascimento = clienteCriado.DataNascimento,                    EstadoCivil = clienteCriado.EstadoCivil,
                    Sexo = clienteCriado.Sexo,
                    CondicaoPagamentoId = clienteCriado.CondicaoPagamentoId, // Agora tanto origem quanto destino são long?
                    LimiteCredito2 = clienteCriado.LimiteCredito2,
                    Observacao = clienteCriado.Observacao,
                    DataCriacao = clienteCriado.DataCriacao,
                    DataAlteracao = clienteCriado.DataAlteracao,
                    UserCriacao = clienteCriado.UserCriacao,
                    UserAtualizacao = clienteCriado.UserAtualizacao
                };
                
                return CreatedAtAction(nameof(GetCliente), new { id = clienteDTO.Id }, clienteDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar cliente", erro = ex.Message });
            }
        }        /* ESTE MÉTODO FOI REMOVIDO PARA RESOLVER A AMBIGUIDADE
        [HttpPost]
        public async Task<IActionResult> PostCliente([FromBody] ClienteDto clienteDto)
        {
            // Sua lógica para criar o cliente
            // Exemplo:
            // var cliente = _mapper.Map<Cliente>(clienteDto);
            // _context.Clientes.Add(cliente);
            // await _context.SaveChangesAsync();
            // return CreatedAtAction(nameof(GetCliente), new { id = cliente.Id }, cliente);
            return Ok(new { message = "Cliente criado com sucesso", id = 1 }); // Exemplo de resposta
        }
        */

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCliente(long id, [FromBody] ClienteUpdateDTO clienteUpdateDto)
        {
            Console.WriteLine($"[ClienteController.PutCliente] INÍCIO - ID: {id}");
            if (clienteUpdateDto == null)
            {
                Console.WriteLine("[ClienteController.PutCliente] ERRO: Objeto clienteUpdateDto recebido é nulo.");
                return BadRequest("Objeto clienteUpdateDto não pode ser nulo.");
            }

            Console.WriteLine($"[ClienteController.PutCliente] Dados recebidos: Nome='{clienteUpdateDto.Nome}', RazaoSocial='{clienteUpdateDto.RazaoSocial}', CNPJ='{clienteUpdateDto.CNPJ}', Ativo={clienteUpdateDto.Ativo}");            if (!ModelState.IsValid)
            {
                Console.WriteLine("[ClienteController.PutCliente] ERRO: ModelState inválido.");
                return BadRequest(ModelState);
            }

            try
            {
                var clienteExistente = await _clienteService.GetByIdAsync(id);
                if (clienteExistente == null)
                {
                    Console.WriteLine($"[ClienteController.PutCliente] ERRO: Cliente com ID {id} não encontrado para atualização.");
                    return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });
                }

                Console.WriteLine($"[ClienteController.PutCliente] Cliente existente encontrado: TipoPessoa='{clienteExistente.TipoPessoa}', Nome='{clienteExistente.Nome}', RazaoSocial='{clienteExistente.RazaoSocial}'");

                // Atualizar campos comuns
                clienteExistente.Nome = clienteUpdateDto.Nome ?? clienteExistente.Nome; 
                clienteExistente.Email = clienteUpdateDto.Email ?? clienteExistente.Email;
                clienteExistente.Telefone = clienteUpdateDto.Telefone ?? clienteExistente.Telefone;
                clienteExistente.Endereco = clienteUpdateDto.Endereco ?? clienteExistente.Endereco;
                clienteExistente.Numero = clienteUpdateDto.Numero ?? clienteExistente.Numero;
                clienteExistente.Complemento = clienteUpdateDto.Complemento ?? clienteExistente.Complemento;
                clienteExistente.Bairro = clienteUpdateDto.Bairro ?? clienteExistente.Bairro;
                clienteExistente.CEP = clienteUpdateDto.CEP ?? clienteExistente.CEP;

                // Atualizar campos específicos baseados no tipo de pessoa
                if (clienteExistente.TipoPessoa == "J")
                {
                    Console.WriteLine($"[ClienteController.PutCliente] Atualizando campos de PJ: Nova RazaoSocial='{clienteUpdateDto.RazaoSocial}', Novo NomeFantasia='{clienteUpdateDto.NomeFantasia}'");
                    clienteExistente.RazaoSocial = clienteUpdateDto.RazaoSocial ?? clienteExistente.RazaoSocial;
                    clienteExistente.NomeFantasia = clienteUpdateDto.NomeFantasia ?? clienteExistente.NomeFantasia;
                    clienteExistente.CNPJ = clienteUpdateDto.CNPJ ?? clienteExistente.CNPJ;
                    clienteExistente.InscricaoEstadual = clienteUpdateDto.InscricaoEstadual ?? clienteExistente.InscricaoEstadual;
                }
                else if (clienteExistente.TipoPessoa == "F")
                {
                    clienteExistente.CPF = clienteUpdateDto.CPF ?? clienteExistente.CPF;
                }
                
                // Atualizar cidade se informada
                if (clienteUpdateDto.CidadeId.HasValue && clienteUpdateDto.CidadeId > 0)
                {
                    clienteExistente.CidadeId = clienteUpdateDto.CidadeId;
                }
                  clienteExistente.Ativo = clienteUpdateDto.Ativo;
                
                // Atualizar os campos de auditoria para rastrear a última alteração
                clienteExistente.DataAlteracao = DateTime.Now;
                clienteExistente.UserAtualizacao = User.Identity?.Name ?? "sistema";
                
                Console.WriteLine($"[ClienteController.PutCliente] Cliente pronto para salvar: RazaoSocial='{clienteExistente.RazaoSocial}', Ativo={clienteExistente.Ativo}, DataAlteracao={clienteExistente.DataAlteracao}");

                await _clienteService.SaveAsync(clienteExistente);

                Console.WriteLine($"[ClienteController.PutCliente] Cliente ID {id} atualizado com sucesso.");
                return NoContent();
            }
            catch (DbUpdateConcurrencyException dbcex)
            {
                Console.WriteLine($"[ClienteController.PutCliente] ERRO de concorrência ao atualizar cliente ID {id}: {dbcex.Message}");
                return StatusCode(StatusCodes.Status409Conflict, new { mensagem = "Conflito de concorrência ao salvar os dados. Tente novamente.", erro = dbcex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClienteController.PutCliente] ERRO GERAL ao atualizar cliente ID {id}: {ex.Message}\nStackTrace: {ex.StackTrace}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { mensagem = "Erro interno ao atualizar cliente.", erro = ex.Message });
            }
        }        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Inativa um cliente (não remove do banco de dados)")]
        public async Task<IActionResult> Delete(long id)
        {
            Console.WriteLine($"[ClienteController.Delete] Método Delete chamado com ID: {id} - INÍCIO DO MÉTODO");

            try
            {
                // Verificar se o cliente existe
                var cliente = await _clienteService.GetByIdAsync(id);
                if (cliente == null)
                {
                    Console.WriteLine($"[ClienteController.Delete] Cliente ID {id} não encontrado");
                    return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });
                }
                
                // Usar o método de inativação direta via SQL
                var result = await _clienteService.InativarClienteAsync(id);
                
                if (result)
                {
                    Console.WriteLine($"[ClienteController.Delete] Cliente ID {id} inativado com sucesso");
                    return NoContent();
                }
                else
                {
                    Console.WriteLine($"[ClienteController.Delete] Falha ao inativar cliente ID {id}");
                    return StatusCode(500, new { mensagem = $"Falha ao inativar o cliente ID {id}" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClienteController.Delete] ERRO GERAL ao inativar cliente ID {id}: {ex.ToString()}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { mensagem = "Erro interno ao tentar inativar o cliente.", erro = ex.Message });
            }
        }

        // Adicione este novo método ao ClienteController
        [HttpPatch("juridico/{id}")]
        public async Task<IActionResult> PatchClienteJuridico(long id, [FromBody] ClienteJuridicoUpdateDTO updateDto)
        {
            try
            {
                Console.WriteLine($"[PatchClienteJuridico] Iniciando atualização específica de cliente jurídico ID: {id}");
                Console.WriteLine($"[PatchClienteJuridico] Dados recebidos: RazaoSocial='{updateDto.RazaoSocial}', NomeFantasia='{updateDto.NomeFantasia}'");
                
                // Crie um dicionário apenas com os campos não nulos
                var fieldsToUpdate = new Dictionary<string, object>();
                
                if (updateDto.RazaoSocial != null)
                    fieldsToUpdate.Add("RazaoSocial", updateDto.RazaoSocial);
                    
                if (updateDto.NomeFantasia != null)
                    fieldsToUpdate.Add("NomeFantasia", updateDto.NomeFantasia);
                    
                if (updateDto.InscricaoEstadual != null)
                    fieldsToUpdate.Add("InscricaoEstadual", updateDto.InscricaoEstadual);
                
                // Adicionar um campo explícito para garantir que o cliente permaneça ativo
                fieldsToUpdate.Add("Ativo", true);
                
                // Verificar se existem campos para atualizar
                if (fieldsToUpdate.Count == 0)
                {
                    return BadRequest("Nenhum campo válido para atualização");
                }
                
                // Usar o novo método de patch específico
                var clienteAtualizado = await _clienteService.PatchSpecificFieldsAsync(id, fieldsToUpdate);
                
                // Acesso direto ao banco de dados para confirmar a mudança
                Console.WriteLine($"[PatchClienteJuridico] ✅ Cliente após atualização: ID={clienteAtualizado.Id}, RazaoSocial='{clienteAtualizado.RazaoSocial}', Ativo={clienteAtualizado.Ativo}");
                
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PatchClienteJuridico] ERRO: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { mensagem = "Erro ao atualizar cliente jurídico", erro = ex.Message });
            }
        }

        // Criar um novo endpoint de emergência
        [HttpPut("juridico-direct/{id}")]
        public async Task<IActionResult> UpdateJuridicoDirect(long id, [FromBody] ClienteJuridicoUpdateDTO updateDto)
        {
            try
            {
                var success = await _clienteService.UpdateJuridicoDirectSqlAsync(
                    id, 
                    updateDto.RazaoSocial, 
                    updateDto.NomeFantasia, 
                    updateDto.InscricaoEstadual
                );
                
                if (!success)
                    return NotFound($"Cliente jurídico com ID {id} não encontrado ou não foi possível atualizar");
                    
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro na atualização direta", erro = ex.Message });
            }
        }

        // No ClienteController.cs - método para buscar um cliente para edição
        [HttpGet("{id}/edit")]
        public async Task<ActionResult<object>> GetClienteForEdit(long id)
        {
            var cliente = await _clienteService.GetByIdAsync(id);
            
            if (cliente == null)
            {
                return NotFound();
            }
            
            // Retorna um objeto anônimo (DTO) com todos os campos necessários explicitamente
            var clienteDto = new
            {
                id = cliente.Id,
                tipoPessoa = cliente.TipoPessoa,
                nome = cliente.Nome,
                cpf = cliente.CPF,
                // Campos específicos para pessoa jurídica
                razaoSocial = cliente.RazaoSocial,
                nomeFantasia = cliente.NomeFantasia,
                cnpj = cliente.CNPJ,
                inscricaoEstadual = cliente.InscricaoEstadual,
                // Campos comuns
                email = cliente.Email,
                telefone = cliente.Telefone,
                endereco = cliente.Endereco,
                numero = cliente.Numero,
                complemento = cliente.Complemento,
                bairro = cliente.Bairro,
                cep = cliente.CEP,
                cidadeId = cliente.CidadeId,
                ativo = cliente.Ativo,
                cidadeNome = cliente.Cidade?.Nome
            };
            
            return Ok(clienteDto);
        }

        // Novo método de teste
        [HttpGet("test/{id}")]
        public async Task<ActionResult> TestGetCliente(long id)
        {
            try
            {
                // Primeiro só verifica se o cliente existe
                var clienteExists = await _context.Clientes.AnyAsync(c => c.Id == id);
                
                if (!clienteExists)
                {
                    return NotFound($"Cliente {id} não existe");
                }
                
                // Busca apenas dados básicos sem incluir relacionamentos
                var clienteBasico = await _context.Clientes
                    .AsNoTracking()
                    .Where(c => c.Id == id)
                    .Select(c => new {
                        c.Id,
                        c.TipoPessoa,
                        c.Nome,
                        c.CPF,
                        c.RazaoSocial,
                        c.NomeFantasia,
                        c.CNPJ,
                        c.InscricaoEstadual,
                        c.Email,
                        c.Telefone,
                        c.Endereco,
                        c.Numero,
                        c.Complemento,
                        c.Bairro,
                        c.CEP,
                        c.CidadeId,
                        c.Ativo
                    })
                    .FirstOrDefaultAsync();
                    
                return Ok(clienteBasico);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro no teste: {ex.Message}");
            }
        }    }
}