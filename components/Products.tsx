'use client';

import Link from 'next/link';
import {useState, useRef, useEffect} from 'react';
import {ArrowUpRight, Search, X, Wind, Sparkles, Brush, Droplets, ChevronDown} from 'lucide-react';
import {products as defaults, productCategories as defaultCategories, type Product, type ProductCategory} from '../data/catalogue';
import ContactAction from './ContactAction';

const normalize = (value:string) => value.normalize('NFD').replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g, '').replace(/[أإآ]/g, 'ا').toLowerCase();

function descriptionPreview(value:string) {
  if (value.length <= 240) return value;
  const openingSentence = value.match(/^.{60,240}?[.!؟?](?:\s|$)/u)?.[0]?.trim();
  return openingSentence || `${value.slice(0, 220).replace(/\s+\S*$/, '').trim()}…`;
}

export default function Products({locale, teaser=false, items=defaults, categories=defaultCategories}:{locale:'fr'|'ar';teaser?:boolean;items?:Product[];categories?:ProductCategory[]}) {
  const ar = locale === 'ar';
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [selected, setSelected] = useState<Product|null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!selected) return;
    const element = dialog.current;
    element?.showModal();
    const prior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = prior;
    };
  }, [selected]);

  const name = (product:Product) => product.name[locale] || product.name.fr;
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

  const art = (product:Product, detail=false) => {
    const Icon = product.category_id === 'appareils' ? Wind : product.category_id === 'brosses' ? Brush : product.category_id === 'cheveux' ? Droplets : Sparkles;
    return product.image
      ? <img src={product.image} alt={name(product)} width="600" height="600" loading={detail ? 'eager' : 'lazy'} decoding="async"/>
      : <div className="catalogue-placeholder" aria-hidden="true"><Icon strokeWidth={.8}/><span>OHH ZAZ</span></div>;
  };
  const description = selected?.description?.[locale] || selected?.description?.fr || '';
  const orderMessage = selected ? (selected.status === 'published'
    ? (ar
      ? `مرحباً، أود طلب ${name(selected)}${selected.price === null ? '' : `، بالسعر المعروض ${price(selected)}`}. هل هو متوفّر؟ وكيف يمكنني استلام طلبي؟`
      : `Bonjour, je souhaite commander ${name(selected)}${selected.price === null ? '' : ` au prix affiché de ${price(selected)}`}. Est-il disponible ? Comment puis-je récupérer ma commande ?`)
    : (ar ? `مرحباً، أود معرفة موعد توفّر ${name(selected)}.` : `Bonjour, je souhaite connaître la disponibilité prochaine de ${name(selected)}.`)) : '';

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
        {visible.map(product => <button type="button" className="catalogue-card" data-category={product.category_id} key={product.id} onClick={() => setSelected(product)} aria-haspopup="dialog" aria-label={`${ar ? 'تفاصيل' : 'Découvrir'} ${name(product)}`}>
          <div className="catalogue-image">{art(product)}{product.status === 'placeholder' && <span className="catalogue-badge">{ar ? 'قريباً' : 'PROCHAINEMENT'}</span>}<span className="catalogue-arrow"><ArrowUpRight aria-hidden="true"/></span></div>
          <div className="catalogue-copy">{product.status !== 'placeholder' && <p className="catalogue-category">{categoryName(product)}</p>}<h2 title={name(product)}>{name(product)}</h2><p className="catalogue-price"><bdi>{price(product)}</bdi></p><span>{ar ? 'اكتشاف المنتج' : 'Voir le produit'}<ArrowUpRight size={15} aria-hidden="true"/></span></div>
        </button>)}
      </div> : <div className="catalogue-empty"><h2>{ar ? 'ما لقينا حتى نتيجة.' : 'Aucun résultat pour cette recherche.'}</h2><p>{ar ? 'جرّبي كلمة أخرى أو شوفي جميع الفئات.' : 'Essayez un autre mot ou parcourez toutes les catégories.'}</p><button className="button" onClick={clearFilters}>{ar ? 'مسح البحث' : 'Effacer les filtres'}</button></div>}

      <dialog className="product-dialog product-dialog-refined" ref={dialog} aria-labelledby={selected ? 'product-detail-title' : undefined} onCancel={() => setSelected(null)} onClick={event => {if (event.target === event.currentTarget) setSelected(null);}}>
        {selected && <>
          <div className="product-dialog-header"><span>OHH ZAZ <span aria-hidden="true">/</span> {ar ? 'اختيار الصالون' : 'La sélection'}</span><button type="button" className="dialog-close" onClick={() => setSelected(null)} aria-label={ar ? 'إغلاق' : 'Fermer'} autoFocus><X/></button></div>
          <div className="product-dialog-body">
            <div className="product-dialog-image">{art(selected, true)}</div>
            <div className="product-dialog-copy">
              <p className="eyebrow">{selected.status === 'placeholder' ? (ar ? 'قريباً' : 'PROCHAINEMENT') : categoryName(selected)}</p>
              <h2 id="product-detail-title">{name(selected)}</h2>
              <p className="product-detail-price"><bdi>{price(selected)}</bdi></p>
              {description ? <div className="product-description" key={selected.id}><p>{descriptionPreview(description)}</p>{description.length > 240 && <details><summary>{ar ? 'الوصف الكامل' : 'Description complète'}<ChevronDown size={16} aria-hidden="true"/></summary><p>{description}</p></details>}</div> : selected.status === 'placeholder' ? <p>{ar ? 'التشكيلة قيد التحضير.' : 'Notre sélection est en préparation.'}</p> : null}
            </div>
          </div>
          <div className="product-order-bar"><div><span className="product-order-label">{ar ? 'مباشرة من الصالون' : 'Directement auprès du salon'}</span><small>{selected.status === 'published' ? (ar ? 'التوفّر والاستلام يتم تأكيدهما عبر واتساب.' : 'Disponibilité et retrait à confirmer sur WhatsApp.') : (ar ? 'تعرفي على الإطلاق القادم.' : 'Renseignez-vous sur le prochain lancement.')}</small></div><ContactAction platform="whatsapp" locale={locale} message={orderMessage} className="button product-order-button">{selected.status === 'published' ? (ar ? 'اطلبي عبر واتساب' : 'Commander sur WhatsApp') : (ar ? 'معرفة المزيد' : 'En savoir plus')}</ContactAction></div>
        </>}
      </dialog>
    </>}
  </section>;
}
