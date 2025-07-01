using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class VeiculoDTO
    {
        public long Id { get; set; }

        [Required(ErrorMessage = "Placa é obrigatória")]
        [StringLength(7, MinimumLength = 7, ErrorMessage = "Placa deve ter 7 caracteres")]
        public string Placa { get; set; } = string.Empty;

        [Required(ErrorMessage = "UF é obrigatória")]
        [StringLength(2, MinimumLength = 2, ErrorMessage = "UF deve ter 2 caracteres")]
        public string UF { get; set; } = string.Empty;

        [Required(ErrorMessage = "RNTRC é obrigatório")]
        [StringLength(8, ErrorMessage = "RNTRC deve ter no máximo 8 caracteres")]
        public string RNTRC { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tipo de veículo é obrigatório")]
        [StringLength(50, ErrorMessage = "Tipo de veículo deve ter no máximo 50 caracteres")]
        public string TipoVeiculo { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "Tipo de carroceria deve ter no máximo 50 caracteres")]
        public string? TipoCarroceria { get; set; }

        [StringLength(50, ErrorMessage = "Marca deve ter no máximo 50 caracteres")]
        public string? Marca { get; set; }

        [StringLength(50, ErrorMessage = "Modelo deve ter no máximo 50 caracteres")]
        public string? Modelo { get; set; }

        [StringLength(4, ErrorMessage = "Ano deve ter no máximo 4 caracteres")]
        public string? Ano { get; set; }

        [Range(0, 999999.999, ErrorMessage = "Capacidade deve estar entre 0 e 999.999,999")]
        public decimal? Capacidade { get; set; }

        [Required(ErrorMessage = "Transportadora é obrigatória")]
        public long TransportadoraId { get; set; }

        public bool Ativo { get; set; }

        public TransportadoraDTO? Transportadora { get; set; }
    }

    public class CreateVeiculoDTO
    {
        [Required(ErrorMessage = "Placa é obrigatória")]
        [StringLength(7, MinimumLength = 7, ErrorMessage = "Placa deve ter 7 caracteres")]
        public string Placa { get; set; } = string.Empty;

        [Required(ErrorMessage = "UF é obrigatória")]
        [StringLength(2, MinimumLength = 2, ErrorMessage = "UF deve ter 2 caracteres")]
        public string UF { get; set; } = string.Empty;

        [Required(ErrorMessage = "RNTRC é obrigatório")]
        [StringLength(8, ErrorMessage = "RNTRC deve ter no máximo 8 caracteres")]
        public string RNTRC { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tipo de veículo é obrigatório")]
        [StringLength(50, ErrorMessage = "Tipo de veículo deve ter no máximo 50 caracteres")]
        public string TipoVeiculo { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "Tipo de carroceria deve ter no máximo 50 caracteres")]
        public string? TipoCarroceria { get; set; }

        [StringLength(50, ErrorMessage = "Marca deve ter no máximo 50 caracteres")]
        public string? Marca { get; set; }

        [StringLength(50, ErrorMessage = "Modelo deve ter no máximo 50 caracteres")]
        public string? Modelo { get; set; }

        [StringLength(4, ErrorMessage = "Ano deve ter no máximo 4 caracteres")]
        public string? Ano { get; set; }

        [Range(0, 999999.999, ErrorMessage = "Capacidade deve estar entre 0 e 999.999,999")]
        public decimal? Capacidade { get; set; }

        [Required(ErrorMessage = "Transportadora é obrigatória")]
        public long TransportadoraId { get; set; }
    }

    public class UpdateVeiculoDTO : CreateVeiculoDTO
    {
        public bool Ativo { get; set; }
    }
}

namespace SistemaEmpresa.Models.DTOs
{
    public class VeiculoCreateDTO
    {
        [Required(ErrorMessage = "A placa é obrigatória")]
        public string Placa { get; set; } = string.Empty;

        [Required(ErrorMessage = "O modelo é obrigatório")]
        public string Modelo { get; set; } = string.Empty;

        [Required(ErrorMessage = "A marca é obrigatória")]
        public string Marca { get; set; } = string.Empty;

        [Required(ErrorMessage = "O ano é obrigatório")]
        public int Ano { get; set; }

        public decimal Capacidade { get; set; }

        [Required(ErrorMessage = "A transportadora é obrigatória")]
        public long TransportadoraId { get; set; }

        public bool Ativo { get; set; } = true;
    }
}