using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SistemaEmpresa.DTOs
{
    public class CondicaoPagamentoDTO
    {
        public long Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public bool AVista { get; set; }
        public bool Ativo { get; set; }
        public decimal PercentualJuros { get; set; }
        public decimal PercentualMulta { get; set; }
        public decimal PercentualDesconto { get; set; }
        public List<ParcelaCondicaoPagamentoDTO> Parcelas { get; set; } = new List<ParcelaCondicaoPagamentoDTO>();

        [JsonPropertyName("data_cadastro")]
        public DateTime? DataCriacao { get; set; } // ou DataCadastro
        public string? UserCriacao { get; set; }
        public DateTime? DataAlteracao { get; set; }
        public string? UserAtualizacao { get; set; }
    }

    public class CondicaoPagamentoCreateDTO
    {
        [Required(ErrorMessage = "O código é obrigatório")]
        [StringLength(20, ErrorMessage = "O código deve ter no máximo 20 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "A descrição é obrigatória")]
        [StringLength(100, ErrorMessage = "A descrição deve ter no máximo 100 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        public bool AVista { get; set; } = false;
        public bool Ativo { get; set; } = true;
        public decimal PercentualJuros { get; set; } = 0;
        public decimal PercentualMulta { get; set; } = 0;
        public decimal PercentualDesconto { get; set; } = 0;
        public List<ParcelaCondicaoPagamentoCreateDTO> Parcelas { get; set; } = new List<ParcelaCondicaoPagamentoCreateDTO>();
    }

    public class CondicaoPagamentoUpdateDTO
    {
        [Required(ErrorMessage = "O código é obrigatório")]
        [StringLength(20, ErrorMessage = "O código deve ter no máximo 20 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "A descrição é obrigatória")]
        [StringLength(100, ErrorMessage = "A descrição deve ter no máximo 100 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        public bool AVista { get; set; } = false;
        public bool Ativo { get; set; } = true;
        public decimal PercentualJuros { get; set; } = 0;
        public decimal PercentualMulta { get; set; } = 0;
        public decimal PercentualDesconto { get; set; } = 0;
        public List<ParcelaCondicaoPagamentoCreateDTO> Parcelas { get; set; } = new List<ParcelaCondicaoPagamentoCreateDTO>();
    }
}