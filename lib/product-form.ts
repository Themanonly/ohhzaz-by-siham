export const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export type ProductField = 'photo'|'name'|'nameAr'|'price'|'category'|'description'|'descriptionAr';
export type ProductErrors = Partial<Record<ProductField,string>>;

export function photoError(file: Pick<File,'type'|'size'>): string | undefined {
 if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return 'Choisissez une photo JPG, PNG ou WebP. Pour une photo HEIC, exportez-la en JPG.';
 if (!file.size) return 'Cette photo est vide. Choisissez un autre fichier.';
 if (file.size > MAX_PHOTO_BYTES) return 'La photo dépasse 20 Mo. Choisissez une version plus légère.';
}
export function productFormErrors(value:{name:string;nameAr:string;price:string;category:string;description:string;descriptionAr:string;photo:File|null;existingImage?:string},categories:string[]):ProductErrors {
 const errors:ProductErrors={};
 if (value.photo) {const error=photoError(value.photo);if(error)errors.photo=error;}
 else if(!value.existingImage) errors.photo='Ajoutez une photo du produit.';
 if(!value.name.trim()||value.name.trim().length>160) errors.name='Indiquez un nom de 1 à 160 caractères.';
 if(value.nameAr.trim().length>160) errors.nameAr='Le nom arabe doit contenir au maximum 160 caractères.';
 const price=value.price.trim().replace(',','.');
 if(!/^\d+(\.\d{1,2})?$/.test(price)||Number(price)>99999999) errors.price='Indiquez un prix entre 0 et 99 999 999 DH, avec deux décimales maximum (ex. 299,90).';
 if(!categories.includes(value.category)) errors.category='Choisissez une catégorie. Si la liste est vide, créez d’abord une catégorie.';
 if(value.description.trim().length>2000) errors.description='La description française dépasse 2 000 caractères.';
 if(value.descriptionAr.trim().length>2000) errors.descriptionAr='La description arabe dépasse 2 000 caractères.';
 return errors;
}

// Keep image requests well below the hosting platform's binary payload limit.
// The server still decodes, bounds and re-encodes every uploaded image.
export async function prepareProductPhoto(file:File):Promise<Blob> {
 const error=photoError(file);if(error)throw new Error(error);
 const url=URL.createObjectURL(file);
 try {
  const image=await new Promise<HTMLImageElement>((resolve,reject)=>{
   const img=new Image();
   const timer=setTimeout(()=>{img.src='';reject(new Error('La photo prend trop de temps à ouvrir. Essayez un autre fichier.'));},15000);
   img.onload=()=>{clearTimeout(timer);resolve(img);};
   img.onerror=()=>{clearTimeout(timer);reject(new Error('Cette photo ne peut pas être ouverte. Exportez-la en JPG ou choisissez un autre fichier.'));};
   img.src=url;
  });
  if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>40000000) throw new Error('La photo est trop grande. Exportez une version de moins de 40 mégapixels.');
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const context=canvas.getContext('2d');if(!context)throw new Error('Impossible de préparer la photo dans ce navigateur. Essayez un navigateur à jour.');
  context.drawImage(image,0,0,canvas.width,canvas.height);
  for(const quality of [.88,.76,.64]) {
   const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',quality));
   if(blob&&blob.size<=MAX_UPLOAD_BYTES)return blob;
  }
  throw new Error('Cette photo reste trop volumineuse. Choisissez une version plus légère.');
 } finally {URL.revokeObjectURL(url);}
}
