using SistemaEmpresa.Models;
using SistemaEmpresa.DTOs;

public class MappingService
{
    public Estado MapEstadoDTOToEstado(EstadoDTO dto)
    {
        return new Estado
        {
            Id = dto.Id, // Remover o cast para int
            Nome = dto.Nome,
            UF = dto.UF,
            PaisId = dto.PaisId // Remover o cast para int
        };
    }
    
    public EstadoDTO MapEstadoToEstadoDTO(Estado estado)
    {
        return new EstadoDTO
        {
            Id = estado.Id,
            Nome = estado.Nome,
            UF = estado.UF,
            PaisId = estado.PaisId,
            PaisNome = estado.Pais?.Nome
        };
    }
}