using SistemaEmpresa.Models;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace SistemaEmpresa.Services
{
    public class EstadoService
    {
        private readonly EstadoRepository _repository;
        private readonly PaisRepository _paisRepository;

        public EstadoService(EstadoRepository repository, PaisRepository paisRepository)
        {
            _repository = repository;
            _paisRepository = paisRepository;
        }        public async Task<EstadoDTO> Create(EstadoCreateDTO estadoDTO)
        {
            // Validar se já existe estado com a mesma UF no mesmo país
            bool existeUFDuplicada = await _repository.ExisteUFDuplicadaNoPais(estadoDTO.UF, estadoDTO.PaisId);
            if (existeUFDuplicada)
            {
                throw new Exception($"Já existe um estado com a UF '{estadoDTO.UF}' neste país. A UF deve ser única para cada país.");
            }
            
            // Converte DTO para modelo
            var estadoModel = new Estado
            {
                Nome = estadoDTO.Nome,
                PaisId = estadoDTO.PaisId,
                UF = estadoDTO.UF,
                Situacao = estadoDTO.Situacao,
                DataCriacao = DateTime.Now,
                UserCriacao = estadoDTO.UserCriacao
            };
            
            // Cria o estado
            bool sucesso = await _repository.Create(estadoModel);
            
            if (sucesso)
            {
                // Se criado com sucesso, retornamos o DTO recém-criado
                var resultado = await _repository.ReadById(estadoModel.Id);
                if (resultado == null)
                {
                    throw new Exception("Estado criado, mas não foi possível recuperá-lo");
                }
                return resultado;
            }
            
            throw new Exception("Não foi possível criar o estado");
        }

        public async Task<bool> Delete(long id)
        {
            return await _repository.Delete(id);
        }

        // Método principal para obter todos os estados
        public async Task<List<EstadoDTO>> GetAll()
        {
            try
            {
                // Buscar estados com os dados do país incluídos
                var estados = await _repository.ReadAllWithPais();                // Mapear para DTOs usando o método auxiliar
                var estadosDTO = estados.Select(e => MapEstadoToDTO(e, e.Pais?.Nome)).ToList();
                
                return estadosDTO;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar estados: {ex.Message}");
                throw new Exception($"Erro ao buscar estados: {ex.Message}");
            }
        }

        public async Task<List<EstadoDTO>> GetAllSeguro()
        {
            try
            {
                // Usar o repositório em vez de acessar o contexto diretamente
                var estados = await _repository.ReadAllWithPais();                // Mapear manualmente para garantir tratamento de valores nulos
                var estadosDTO = estados.Select(e => MapEstadoToDTO(e, e.Pais?.Nome)).ToList();
                
                return estadosDTO;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar estados: {ex.Message}");
                throw new Exception($"Erro ao buscar estados: {ex.Message}", ex);
            }
        }

        // Método principal para obter um estado por ID
        public async Task<EstadoDTO> GetById(long id)
        {
            try 
            {                var estado = await _repository.ReadById(id);
                
                if (estado == null)
                    throw new Exception($"Estado com ID {id} não encontrado");
                    
                // Garantir que não haja propriedades nulas
                estado.UF ??= string.Empty;
                estado.PaisNome = estado.PaisNome ?? string.Empty;
                
                return estado;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar estado por ID {id}: {ex.Message}");
                throw new Exception($"Erro ao buscar estado por ID: {ex.Message}");
            }
        }

        // Método principal para obter estados por país
        public async Task<IEnumerable<EstadoDTO>> GetByPaisId(long paisId)
        {
            try
            {
                // Verificar se o país existe - com conversão para int
                var pais = await _paisRepository.ReadById((int)paisId);
                if (pais == null)
                {
                    throw new Exception($"País com ID {paisId} não encontrado");
                }

                // Buscar estados do país com país incluído
                var estados = await _repository.ReadByPaisIdWithPais(paisId);                // Converter para DTOs com tratamento para nulos
                var estadosDTO = estados.Select(e => MapEstadoToDTO(e, e.Pais?.Nome)).ToList();
                
                return estadosDTO;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar estados por país ID {paisId}: {ex.Message}");
                throw new Exception($"Erro ao buscar estados por país: {ex.Message}");
            }
        }        public async Task<EstadoDTO> Update(long id, EstadoUpdateDTO dto)
        {
            // Verifica se o estado existe
            var estadoExistente = await _repository.ReadById(id);
            if (estadoExistente == null)
                throw new Exception($"Estado com ID {id} não encontrado");
            
            // Validar se já existe outro estado com a mesma UF no mesmo país
            // Passamos o ID do estado atual para que ele seja ignorado na verificação
            bool existeUFDuplicada = await _repository.ExisteUFDuplicadaNoPais(dto.UF, dto.PaisId, id);
            if (existeUFDuplicada)
            {
                throw new Exception($"Já existe um estado com a UF '{dto.UF}' neste país. A UF deve ser única para cada país.");
            }
            
            // Cria um modelo Estado para atualização
            var estadoModel = new Estado
            {
                Id = id,
                Nome = dto.Nome,
                UF = dto.UF,
                PaisId = dto.PaisId,
                Situacao = dto.Situacao,
                DataAtualizacao = DateTime.Now,
                UserAtualizacao = dto.UserAtualizacao
            };

            // Salva as alterações
            bool sucesso = await _repository.Update(id, estadoModel);
            
            if (!sucesso)
                throw new Exception("Falha ao atualizar estado");
                
            // Retorna o objeto atualizado
            return await GetById(id);
        }
        
        // Métodos antigos mantidos temporariamente para compatibilidade, redirecionando para os novos
        public async Task<List<EstadoDTO>> ReadAll() => await GetAll();
        public async Task<EstadoDTO> ReadById(long id) => await GetById(id);
        public async Task<List<EstadoDTO>> ReadByPaisId(long paisId) => 
            (await GetByPaisId(paisId)).ToList();        // Método auxiliar para mapear consistentemente Estado para EstadoDTO
        private EstadoDTO MapEstadoToDTO(Estado estado, string? paisNome = null)
        {
            if (estado == null) throw new ArgumentNullException(nameof(estado), "Estado não pode ser nulo");
            
            return new EstadoDTO
            {
                Id = estado.Id,
                Nome = estado.Nome ?? string.Empty,
                UF = estado.UF ?? string.Empty,
                PaisId = estado.PaisId,
                PaisNome = paisNome ?? string.Empty,
                Situacao = estado.Situacao,
                DataCriacao = estado.DataCriacao,
                DataAtualizacao = estado.DataAtualizacao,
                UserCriacao = estado.UserCriacao,
                UserAtualizacao = estado.UserAtualizacao
            };
        }
    }
}