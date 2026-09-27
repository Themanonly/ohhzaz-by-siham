export type Service={fr:string;ar:string;price:number;image?:string;from?:boolean;alternative?:number;minutes?:number};
export type Category={id:string;fr:string;ar:string;items:Service[]};
// Authoritative: owner-supplied Tarifs.pdf, visually checked 26 September 2026. AM = ammoniaque.
export const categories:Category[]=[
{id:'coiffure',fr:'Coiffure',ar:'الشعر',items:[
{image:'brushing',fr:'Brushing',ar:'تصفيف بالسشوار',price:60,from:true},
{image:'coupe',fr:'Coupe & brushing',ar:'قصّ الشعر مع السشوار',price:200},
{image:'couleur',fr:'Coloration avec ammoniaque',ar:'صبغة بالأمونيا',price:250,from:true},
{image:'couleur',fr:'Coloration sans ammoniaque',ar:'صبغة بدون أمونيا',price:300,from:true},
{image:'couleur',fr:'Balayage',ar:'بالياج',price:800,from:true},
{image:'couleur',fr:'Flash',ar:'فلاش',price:800,from:true},
{image:'soin-cheveux',fr:'Soin protéiné',ar:'عناية بالبروتين',price:1000,from:true},
{image:'chignon',fr:'Chignon',ar:'رفعة شعر',price:350,from:true}]},
{id:'onglerie',fr:'Onglerie',ar:'الأظافر',items:[
{image:'ongles',fr:'Manucure',ar:'مانيكير',price:70},
{image:'pedicure',fr:'Pédicure',ar:'باديكير',price:100},
{image:'ongles',fr:'Pose vernis',ar:'طلاء الأظافر',price:30},
{image:'ongles',fr:'Semi-permanent',ar:'طلاء شبه دائم',price:100},
{image:'ongles',fr:'Gel',ar:'جيل الأظافر',price:200}]},
{id:'maquillage',fr:'Maquillage & cils',ar:'المكياج والرموش',items:[
{image:'maquillage',fr:'Maquillage simple',ar:'مكياج بسيط',price:300},
{image:'maquillage',fr:'Maquillage invitée',ar:'مكياج المدعوات',price:400,from:true},
{image:'cils',fr:'Cils — normal',ar:'رموش عادية',price:100},
{image:'cils',fr:'Cils — permanent',ar:'رموش دائمة',price:250}]},
{id:'epilation',fr:'Épilation',ar:'إزالة الشعر',items:[
{image:'sourcils',fr:'Sourcils',ar:'الحواجب',price:40},
{image:'teinture-sourcils',fr:'Teinture sourcils',ar:'صبغ الحواجب',price:40},
{image:'sourcils',fr:'Duvet',ar:'الزغب',price:40},
{image:'epilation',fr:'Aisselles',ar:'الإبطان',price:50},
{image:'epilation',fr:'Demi-jambes',ar:'نصف الساقين',price:50},
{image:'epilation',fr:'Avant-bras',ar:'الساعدان',price:50},
{image:'epilation',fr:'Jambe complète',ar:'الساق بالكامل',price:70},
{image:'epilation',fr:'Bras complet',ar:'الذراع بالكامل',price:60}]},
{id:'soins',fr:'Soins du visage',ar:'العناية بالوجه',items:[
{image:'visage',fr:'Soin anti-âge',ar:'عناية مضادة لعلامات التقدم في السن',price:300},
{image:'visage',fr:'Soin éclat',ar:'عناية بالإشراقة',price:250}]}];
