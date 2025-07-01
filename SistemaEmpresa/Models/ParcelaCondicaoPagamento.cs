using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SistemaEmpresa.Models
{
    [Table("parcela_condicao_pagamento")]
    public class ParcelaCondicaoPagamento
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("condicao_pagamento_id")]
        public long CondicaoPagamentoId { get; set; }

        [Required]
        [Column("numero")]
        public int Numero { get; set; }

        [Required]
        [Column("dias")]
        public int Dias { get; set; }

        [Required]
        [Column("percentual")]
        [Precision(10, 2)]
        public decimal Percentual { get; set; }

        [Column("forma_pagamento_id")]
        public long? FormaPagamentoId { get; set; }

        [Column("data_cadastro")]
        public DateTime DataCadastro { get; set; } = DateTime.Now;

        [Column("ultima_modificacao")]
        public DateTime UltimaModificacao { get; set; } = DateTime.Now;

        [ForeignKey("CondicaoPagamentoId")]
        public virtual CondicaoPagamento? CondicaoPagamento { get; set; }

        [ForeignKey("FormaPagamentoId")]
        public virtual FormaPagamento? FormaPagamento { get; set; }
    }
}