using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SistemaEmpresa.Models
{
    [Table("condicao_pagamento")]
    public class CondicaoPagamento
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("codigo")]
        [StringLength(20)]
        public string Codigo { get; set; } = string.Empty;

        [Required]
        [Column("descricao")]
        [StringLength(100)]
        public string Descricao { get; set; } = string.Empty;

        [Column("a_vista")]
        public bool AVista { get; set; } = false;

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        [Column("percentual_juros")]
        [Precision(10, 2)]
        public decimal PercentualJuros { get; set; } = 0;

        [Column("percentual_multa")]
        [Precision(10, 2)]
        public decimal PercentualMulta { get; set; } = 0;

        [Column("percentual_desconto")]
        [Precision(10, 2)]
        public decimal PercentualDesconto { get; set; } = 0;
        
        [Column("data_cadastro")]
        public DateTime DataCadastro { get; set; } = DateTime.Now;

        [Column("ultima_modificacao")]
        public DateTime UltimaModificacao { get; set; } = DateTime.Now;

        [InverseProperty("CondicaoPagamento")]
        public virtual ICollection<ParcelaCondicaoPagamento> Parcelas { get; set; } = new List<ParcelaCondicaoPagamento>();
    }
}
