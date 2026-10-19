'use client';

import Link from 'next/link';
import {useState} from 'react';
import {ArrowUpRight, Search, X, Wind, Sparkles, Brush, Droplets} from 'lucide-react';
import {products as defaults, productCategories as defaultCategories, type Product, type ProductCategory} from '../data/catalogue';
import {productPath} from '../lib/product-links';

const normalize = (value:string) => value.normalize('NFD').replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g, '').replace(/[أإآ]/g, 'ا').toLowerCase();

export default function Products({locale, teaser=false, items=defaults, categories=defaultCategories}:{locale:'fr'|'ar';teaser?:boolean;items?:Product[];categories?:ProductCategory[]}) {
  const ar = locale === 'ar';
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const name = (product:Product) => product.name[locale] || product.name.fr;
  const displayName = (product:Product) => ar ? name(product).split(/(\([A-Za-z][^)]*\)|[A-Za-z][A-Za-z0-9]*(?:\s+[A-Za-z0-9]+)*|\d+(?:[.,]\d+)*)/g).map((part,index)=>/^[A-Za-z0-9(]/.test(part)?<bdi dir="ltr" key={index}>{part}</bdi>:part) : name(product);
  const categoryName = (product:Product) => {
    const value = categories.find(entry => entry.id === product.category_id)?.name;
    return value?.[locale] || value?.fr;
  };
  const price = (product:Product) => product.price === null
    ? (ar ? 'السعر عند الإطلاق' : 'Prix au lancement')
    : new Intl.NumberFormat(ar ? 'ar-MA' : 'fr-MA', {style:'currency', currency:'MAD', maximumFractionDigits:2}).format(product.price);
  const clearFilters = () => {setQuery(''); setCategory('all');};
  const visible = items.filter(product => product.status !== 'draft'
    && (category === 'all' || product.category_id === category)
    && normalize([product.name.fr, product.name.ar, product.description?.fr, product.description?.ar, categoryName(product)].join(' ')).includes(normalize(query)))
    .sort((a, b) => sort === 'low' ? (a.price ?? Infinity) - (b.price ?? Infinity)
      : sort === 'high' ? (b.price ?? -Infinity) - (a.price ?? -Infinity)
      : sort === 'name' ? name(a).localeCompare(name(b), locale) : 0);

  const art = (product:Product) => {
    const Icon = product.category_id === 'appareils' ? Wind : product.category_id === 'brosses' ? Brush : product.category_id === 'cheveux' ? Droplets : Sparkles;
    const source=product.image;
    return source
      ? <img src={source} srcSet={source.startsWith('/api/media/')?`${source}?w=320 320w, ${source}?w=640 640w, ${source}?w=960 960w, ${source}?w=1600 1600w`:undefined} sizes='(max-width: 600px) 88vw, (max-width: 1000px) 44vw, 425px' alt={name(product)} width="600" height="600" loading="lazy" decoding="async"/>
      : <div className="catalogue-placeholder" aria-hidden="true"><Icon strokeWidth={.8}/><span>OHH ZAZ</span></div>;
  };
  return <section className={`section products catalogue-refined ${teaser ? 'products-teaser' : 'page-start'}`} data-scroll-key="products">
    <div className="section-heading">
      <div><p className="eyebrow">{ar ? 'اختيار الصالون' : 'LA SÉLECTION DU SALON'}</p>
        {teaser ? <h2>{ar ? 'بعد زيارة الصالون.' : 'Après le salon.'}</h2> : <h1>{ar ? 'الجمال، حتى عندك فالدار.' : 'Le soin continue chez vous.'}</h1>}
      </div>
      <p className="products-intro">{items.some(product => product.status === 'published')
        ? (ar ? 'عناية وأدوات لتكملي روتين جمالك. اختاري منتجك واطلبيه مباشرة من الصالون.' : 'Des soins et des outils pour votre routine. Choisissez votre produit, commandez directement auprès du salon.')
        : (ar ? 'العناية بالشعر، مستحضرات التجميل والأجهزة. اكتشفي الفئات القادمة.' : 'Soins, cosmétiques et appareils. Découvrez les catégories de notre future sélection.')}</p>
    </div>
    {teaser ? <Link className="text-link" href={`/${locale}/produits`}>{ar ? 'اكتشاف المنتجات' : 'Explorer la sélection'}<ArrowUpRight size={17}/></Link> : <>
      <div className="catalogue-toolbar">
        <label className="catalogue-search"><Search size={19}/><span className="sr-only">{ar ? 'البحث في المنتجات' : 'Rechercher un produit'}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={ar ? 'منتج، فرشاة، جهاز…' : 'Un soin, une brosse, un appareil…'}/></label>
        <label className="catalogue-sort">{ar ? 'الترتيب' : 'Trier'}<select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">{ar ? 'اختيار الصالون' : 'Sélection du salon'}</option><option value="name">{ar ? 'الاسم' : 'Nom'}</option><option value="low">{ar ? 'السعر تصاعدياً' : 'Prix croissant'}</option><option value="high">{ar ? 'السعر تنازلياً' : 'Prix décroissant'}</option></select></label>
      </div>
      <div className="price-filters catalogue-filters" role="group" aria-label={ar ? 'فئات المنتجات' : 'Catégories de produits'}>
        {[{id:'all', name:{fr:'Tout voir', ar:'الكل'}}, ...categories].map(entry => <button key={entry.id} aria-pressed={category === entry.id} onClick={() => setCategory(entry.id)}>{entry.name[locale] || entry.name.fr}</button>)}
      </div>
      <div className="catalogue-results"><p className="catalogue-count" role="status">{visible.length} {ar ? 'نتيجة' : visible.length === 1 ? 'produit' : 'produits'}</p>{(query || category !== 'all') && <button className="text-link" onClick={clearFilters}><X size={14}/>{ar ? 'مسح الفلاتر' : 'Effacer les filtres'}</button>}</div>
      {visible.length ? <div className={`catalogue-grid${visible.length === 1 ? ' catalogue-grid--single' : ''}`}>
        {visible.map(product => <Link href={product.status==='published'?productPath(locale,product.id):`/${locale}/contact`} className="catalogue-card" data-category={product.category_id} key={product.id} aria-label={`${ar ? 'تفاصيل' : 'Découvrir'} ${name(product)}`}>
          <div className="catalogue-image">{art(product)}{product.status === 'placeholder' && <span className="catalogue-badge">{ar ? 'قريباً' : 'PROCHAINEMENT'}</span>}<span className="catalogue-arrow"><ArrowUpRight aria-hidden="true"/></span></div>
          <div className="catalogue-copy">{product.status !== 'placeholder' && <p className="catalogue-category">{categoryName(product)}</p>}<h2 title={name(product)}>{displayName(product)}</h2><p className="catalogue-price"><bdi>{price(product)}</bdi></p><span>{ar ? 'اكتشاف المنتج' : 'Voir le produit'}<ArrowUpRight size={15} aria-hidden="true"/></span></div>
        </Link>)}
      </div> : <div className="catalogue-empty"><h2>{ar ? 'ما لقينا حتى نتيجة.' : 'Aucun résultat pour cette recherche.'}</h2><p>{ar ? 'جرّبي كلمة أخرى أو شوفي جميع الفئات.' : 'Essayez un autre mot ou parcourez toutes les catégories.'}</p><button className="button" onClick={clearFilters}>{ar ? 'مسح البحث' : 'Effacer les filtres'}</button></div>}


    </>}
  </section>;
}
