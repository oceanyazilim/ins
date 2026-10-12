/**
 * Sayfa bazlı sık sorulan sorular. Fiyat tutarları burada YAZILMAZ: {{fiyat:1+1}} gibi
 * yer tutucular gösterim sırasında merkezi fiyat verisiyle doldurulur (src/lib/tokens.ts).
 * {{bolgeler}} aktif hizmet bölgeleriyle, {{telefon}} güncel telefonla değiştirilir.
 */
export const seedFaqs: Record<string, { q: string; a: string }[]> = {
  home: [
    { q: '1+1 ev boyama fiyatı ne kadar?', a: 'Ocean İnşaat’ın 1+1 daireler için ilan ettiği ev boyama paket fiyatı {{fiyat:1+1}}’dir. Nihai teklif, dairenin durumu ve istenen kapsam değerlendirildikten sonra netleşir.' },
    { q: '2+1 daire boyama fiyatı nedir?', a: '2+1 daireler için ilan edilen paket fiyatı {{fiyat:2+1}}, 3+1 daireler için {{fiyat:3+1}}’dir. Güncel fiyatların tamamını boya fiyatları sayfasında bulabilirsiniz.' },
    { q: 'Boya fiyatlarını hangi faktörler etkiler?', a: 'Dairenin tipi ve büyüklüğü, duvarların mevcut durumu, onarım ihtiyacı, renk değişimi, dairenin boş ya da eşyalı olması ve istenen ek işler kapsamı ve dolayısıyla teklifi etkileyen başlıca etkenlerdir.' },
    { q: 'Eşyalı ev boyanabilir mi?', a: 'Evet. Eşyalı evlerde eşyaların korunması ve odaların sırası uygulama öncesinde planlanır. Eşya yoğunluğu kapsamı etkileyebildiği için teklif aşamasında ayrıca değerlendirilir.' },
    { q: 'Boya öncesi hangi hazırlıklar yapılır?', a: 'Yüzey kontrol edilir; çatlak, kabarma ve delikler onarılır, gerekli yerlerde astar uygulanır, zemin ve eşyalar örtülerek korunur. Hangi hazırlıkların gerektiği dairenin durumuna göre belirlenir.' },
    { q: 'Hangi bölgelerde hizmet veriyorsunuz?', a: 'Merkezimiz Sancaktepe’dedir. Şu anda {{bolgeler}} ilçelerinde hizmet veriyoruz.' },
    { q: 'Teklif almak için hangi bilgiler gerekli?', a: 'Daire tipi, ilçe ve mahalle, dairenin boş ya da eşyalı olduğu bilgisi ve size ulaşabileceğimiz bir telefon numarası yeterlidir. Duvarların durumunu gösteren birkaç fotoğraf eklemeniz değerlendirmeyi hızlandırır.' },
  ],
  'ev-boyama': [
    { q: 'Ev boyama hizmeti neleri kapsar?', a: 'Hizmetin kapsamı dairenin durumuna ve talebinize göre belirlenir. Tavan boyası, duvar onarımı, boya malzemesi ve uygulanacak kat sayısı gibi başlıklar teklif aşamasında yazılı olarak netleştirilir.' },
    { q: 'Paket fiyatı ile nihai teklif aynı mı?', a: 'Paket fiyatı, daire tipine göre ilan edilen başlangıç fiyatıdır. Yüzey onarımı, renk değişimi veya ek işler gibi etkenler değerlendirildikten sonra size özel teklif hazırlanır.' },
    { q: '4+1 veya dubleks daireler için fiyat var mı?', a: 'İlan edilen paketler 1+1, 2+1 ve 3+1 daireler içindir. Diğer daire tipleri için bilgilerinizi iletmeniz hâlinde özel teklif hazırlanır.' },
    { q: 'Boya rengini nasıl seçeceğim?', a: 'Odanın aldığı ışık, zemin ve mobilya renkleri seçimde belirleyicidir. Kararsızsanız blogumuzdaki renk rehberlerinden yararlanabilir, teklif görüşmesinde tercihlerinizi paylaşabilirsiniz.' },
    { q: 'Duvarlarımda çatlak ve kabarma var, önce ne yapılmalı?', a: 'Boyadan önce yüzeyin onarılması gerekir. Sorunlu bölgelerin fotoğraflarını teklif formuna eklerseniz gereken hazırlık teklifte ayrıca belirtilir.' },
    { q: 'Hangi ilçelerde ev boyama yapıyorsunuz?', a: 'Şu anda {{bolgeler}} ilçelerinde hizmet veriyoruz. Merkezimiz Sancaktepe’dedir.' },
  ],
  'boya-fiyatlari': [
    { q: 'Ev boyama fiyatları nelerdir?', a: 'İlan edilen paket fiyatları: 1+1 daire {{fiyat:1+1}}, 2+1 daire {{fiyat:2+1}}, 3+1 daire {{fiyat:3+1}}.' },
    { q: 'Fiyatlara boya malzemesi dahil mi?', a: 'Malzeme ve marka tercihi teklif aşamasında netleştirilen başlıklardandır. Teklifinizde hangi kalemlerin dahil olduğu yazılı olarak belirtilir.' },
    { q: 'Fiyatlara KDV dahil mi?', a: 'KDV durumu teklifinizde açıkça belirtilir. Bu sayfadaki tutarlar ilan edilen paket fiyatlarıdır.' },
    { q: 'Duvar onarımı ek ücrete tabi mi?', a: 'Onarım ihtiyacı daireden daireye değişir. Yüzeyin durumu değerlendirildikten sonra gerekli hazırlık işleri teklifte ayrıca gösterilir.' },
    { q: 'Fiyatlar bölgeye göre değişiyor mu?', a: 'Hayır. İlan edilen paket fiyatları hizmet verdiğimiz bütün ilçelerde aynıdır.' },
    { q: 'Teklif almak ücretli mi?', a: 'Teklif talebi oluşturmak için herhangi bir ödeme yapmanız gerekmez. Formu doldurduktan sonra sizinle iletişime geçilir.' },
  ],
  'teklif-al': [
    { q: 'Talebimi gönderdikten sonra ne olur?', a: 'Talebiniz kaydedilir ve size bir talep numarası verilir. Ekibimiz belirttiğiniz iletişim tercihine göre sizinle iletişime geçerek kapsamı netleştirir.' },
    { q: 'Fotoğraf eklemek zorunlu mu?', a: 'Hayır, isteğe bağlıdır. Ancak duvarların durumunu gösteren birkaç fotoğraf, değerlendirmenin daha hızlı ve isabetli yapılmasını sağlar.' },
    { q: 'Bilgilerim nasıl kullanılıyor?', a: 'Bilgileriniz yalnızca teklif talebinizi değerlendirmek ve sizinle iletişime geçmek için kullanılır. Ayrıntılar KVKK Aydınlatma Metni’nde yer alır.' },
  ],
};
