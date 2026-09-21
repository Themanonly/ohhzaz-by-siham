import fs from 'node:fs/promises';
import sharp from 'sharp';
await sharp('work/refresh/bridal-makeup-portrait.jpg').resize({width:1200}).webp({quality:90}).toFile('public/media/bridal-makeup-stock.webp');
await sharp('work/refresh/bridal-details-stock.jpg').resize({width:1200}).webp({quality:90}).toFile('public/media/bridal-details-stock.webp');
let p='components/BridalExperience.tsx',s=await fs.readFile(p,'utf8');
s=s.replace("image:'bridal-occasion'","image:'bridal-makeup-stock'").replace("image:'bridal-waves'","image:'bridal-details-stock'")
.replace("altFr:'Mise en beauté pour une occasion, archive du salon',altAr:'إطلالة لمناسبة من أرشيف الصالون'","altFr:'Inspiration : portrait de mariée et maquillage lumineux',altAr:'صورة إلهام: بورتريه عروس بمكياج مضيء'")
.replace("altFr:'Coiffure ondulée avec détails tressés et accessoires',altAr:'تسريحة مموجة مع ضفائر وإكسسوارات'","altFr:'Inspiration : perles, voile de dentelle et manucure de mariée',altAr:'صورة إلهام: لؤلؤ وطرحة دانتيل وأظافر العروس'")
.replace('Quelques gestes puisés dans les archives de la maison, pour commencer à imaginer les vôtres.','Créations de la maison et images d’inspiration : un carnet pour affiner vos envies.')
.replace('تصفّحي لمسات من أرشيف الصالون، لتبدئي بتخيّل ما يشبهكِ.','أعمال من الصالون وصور للإلهام، لتتخيّلي ما يشبهكِ.')
.replace("{ar?'من أرشيف الدار':'ARCHIVES DE LA MAISON'}","{active===0?(ar?'من أرشيف الدار':'ARCHIVES DE LA MAISON'):(ar?'صورة للإلهام · ليست من أعمال الصالون':'IMAGE D’INSPIRATION · HORS RÉALISATIONS DU SALON')}");
await fs.writeFile(p,s);
p='components/SalonInterior.tsx';s=await fs.readFile(p,'utf8');
s=s.replace('/media/salon-interior-12.webp','/media/salon-wash-24.webp')
.replace('مرايا بإطارات خشبية وكراسي تصفيف سوداء داخل الصالون','كراسي غسل الشعر ورفوف المناشف داخل الصالون')
.replace('Miroirs encadrés de bois et fauteuils de coiffure noirs dans le salon','Espace de lavage, fauteuils noirs et étagères de serviettes du salon')
.replace('/media/salon-ritual.webp','/media/salon-colour-29.webp')
.replace("alt={ar?'كراسي غسل الشعر ورفوف المناشف':'Fauteuils de lavage et étagères de serviettes'}","alt={ar?'ألوان طلاء الأظافر على رفوف الصالون':'Collection de couleurs sur les étagères du salon'}")
.replace("{ar?'لحظة العناية':'Le temps du soin'}","{ar?'ألوان، حسب رغبتكِ':'La couleur, selon vos envies'}");
await fs.writeFile(p,s);
p='components/Header.tsx';s=await fs.readFile(p,'utf8');
s=s.replace("{links.slice(1).map(([p,n])=><Link key={p} aria-current={page===p?'page':undefined} href={url(p)}>{n}</Link>)}","{links.map(([p,n])=>p?<Link key={p} aria-current={page===p?'page':undefined} href={url(p)}>{n}</Link>:<HomeLink key={p} aria-current={!page?'page':undefined} href={url('')}>{n}</HomeLink>)}");
await fs.writeFile(p,s);
