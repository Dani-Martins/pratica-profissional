using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SistemaEmpresa.DTOs
{
    /// <summary>
    /// DTO para exibição completa de um Estado
    /// </summary>
    public class EstadoDTO
    {
        public long Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string UF { get; set; } = string.Empty;  // Sempre inicializar para evitar nulos
        public long PaisId { get; set; }
        public string PaisNome { get; set; } = string.Empty;  // Nome da propriedade deve coincidir com a consulta SQL
        public bool Situacao { get; set; } = true;
        public DateTime DataCriacao { get; set; }
        public DateTime? DataAtualizacao { get; set; }
        public string? UserCriacao { get; set; }
        public string? UserAtualizacao { get; set; }
        
        // Se a interface estiver usando outra propriedade como "Pais", adicione um alias
        public string Pais 
        { 
            get => PaisNome; 
            set => PaisNome = value; 
        }

        // Construtor para garantir que não haja valores nulos
        public EstadoDTO()
        {
            Nome = string.Empty;
            UF = string.Empty;
            PaisNome = string.Empty;
        }
    }

    /// <summary>
    /// DTO específico para criação de um Estado (POST)
    /// </summary>
    public class EstadoCreateDTO
    {
        [Required(ErrorMessage = "O nome do estado é obrigatório")]
        [StringLength(100, ErrorMessage = "O nome do estado deve ter no máximo 100 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "A UF/Sigla do estado é obrigatória")]
        [StringLength(5, ErrorMessage = "A UF/Sigla do estado deve ter no máximo 5 caracteres")]
        public string UF { get; set; } = string.Empty;

        [Required(ErrorMessage = "O ID do país é obrigatório")]
        public long PaisId { get; set; }
        
        public bool Situacao { get; set; } = true;
        
        [StringLength(100)]
        public string? UserCriacao { get; set; }
    }

    /// <summary>
    /// DTO para atualização de um Estado (PUT)
    /// </summary>
    public class EstadoUpdateDTO
    {
        // Oculta o Id do Swagger, mas mantém a propriedade para uso interno
        [JsonIgnore]
        public long Id { get; set; }

        [Required(ErrorMessage = "O nome do estado é obrigatório")]
        [StringLength(100, ErrorMessage = "O nome do estado deve ter no máximo 100 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "A UF/Sigla do estado é obrigatória")]
        [StringLength(5, ErrorMessage = "A UF/Sigla do estado deve ter no máximo 5 caracteres")]
        public string UF { get; set; } = string.Empty;

        [Required(ErrorMessage = "O ID do país é obrigatório")]
        public long PaisId { get; set; }
        
        public bool Situacao { get; set; } = true;
        
        [StringLength(100)]
        public string? UserAtualizacao { get; set; }
    }
    
    // Classes antigas mantidas para compatibilidade - 
    // Você pode removê-las depois que garantir que não são mais usadas
    [Obsolete("Use EstadoDTO em seu lugar")]
    public class EstadoDetailsDTO
    {
        public long Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string UF { get; set; } = string.Empty;
        public string CodigoIBGE { get; set; } = string.Empty;
        public string Regiao { get; set; } = string.Empty;
        public bool Ativo { get; set; }
        public ICollection<CidadeDTO>? Cidades { get; set; }
    }

    [Obsolete("Use EstadoCreateDTO em seu lugar")]
    public class CreateEstadoDTO
    {
        public string Nome { get; set; } = string.Empty;
        public string UF { get; set; } = string.Empty;
        public string CodigoIBGE { get; set; } = string.Empty;
        public string Regiao { get; set; } = string.Empty;
        public long PaisId { get; set; }
    }

    [Obsolete("Use EstadoUpdateDTO em seu lugar")]
    public class UpdateEstadoDTO : CreateEstadoDTO
    {
        public bool Ativo { get; set; }
    }
}
