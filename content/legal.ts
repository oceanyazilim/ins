/**
 * Hukuki metinler. İşletmenin gerçek veri işleme süreçlerine göre yayın öncesinde bir hukukçu
 * tarafından gözden geçirilmelidir. {{telefon}} ve {{eposta}} yer tutucuları site ayarlarından doldurulur.
 * KVKK metni değiştiğinde src/config/site.ts içindeki KVKK_TEXT_VERSION artırılmalıdır.
 */
export type LegalPage = { slug: string; title: string; description: string; updated: string; body: string };

export const legalPages: LegalPage[] = [
  {
    slug: 'kvkk-aydinlatma-metni',
    title: 'KVKK Aydınlatma Metni',
    description: 'Ocean İnşaat’ın 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verileri nasıl işlediğine ilişkin aydınlatma metni.',
    updated: '2026-10-12',
    body: `Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (“KVKK”) 10. maddesi uyarınca, veri sorumlusu sıfatıyla Ocean İnşaat Taahhüt ve Ticaret (“Ocean İnşaat”) tarafından kişisel verilerinizin işlenmesine ilişkin olarak sizi bilgilendirmek amacıyla hazırlanmıştır.

## İşlenen kişisel veriler

Web sitemizdeki teklif ve iletişim formlarını kullandığınızda aşağıdaki veriler işlenir:

- **Kimlik ve iletişim bilgileri:** ad soyad, telefon numarası, isteğe bağlı olarak e-posta adresi
- **Talep bilgileri:** talep edilen hizmet, daire tipi, dairenin durumu, ilçe ve mahalle bilgisi, yazdığınız açıklamalar
- **Görseller:** isteğe bağlı olarak yüklediğiniz daire fotoğrafları
- **İşlem güvenliği bilgileri:** kötüye kullanımı önlemek amacıyla IP adresinizin geri döndürülemez biçimde özetlenmiş hâli, talep tarihi ve saati
- **Ziyaret kaynağı:** siteye hangi sayfadan veya kampanyadan geldiğinize ilişkin bilgiler

## İşleme amaçları ve hukuki sebepler

Kişisel verileriniz; teklif talebinizin değerlendirilmesi, sizinle iletişime geçilmesi, keşif ve uygulama süreçlerinin planlanması ve talep kayıtlarının tutulması amaçlarıyla, KVKK’nın 5. maddesinin 2. fıkrasının (c) bendi (bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması) ve (f) bendi (veri sorumlusunun meşru menfaati) kapsamında işlenir.

Kampanya ve duyurular hakkında ticari elektronik ileti gönderilmesi **yalnızca açık rızanızın bulunması hâlinde** yapılır. Bu izin teklif almanın koşulu değildir ve dilediğiniz zaman geri alınabilir.

## Verilerin aktarılması

Kişisel verileriniz; yalnızca yukarıdaki amaçlarla sınırlı olmak üzere, barındırma ve e-posta hizmeti aldığımız hizmet sağlayıcılara ve hukuken yetkili kamu kurum ve kuruluşlarına aktarılabilir. Verileriniz üçüncü kişilere satılmaz ve pazarlama amacıyla paylaşılmaz.

## Saklama süresi

Verileriniz, işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen zamanaşımı süreleri boyunca saklanır; bu sürelerin sonunda silinir, yok edilir veya anonim hâle getirilir. Yüklediğiniz fotoğraflar, talebinizin sonuçlanmasının ardından makul süre içinde silinir.

## Haklarınız

KVKK’nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını öğrenme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, aktarıldığı üçüncü kişileri bilme ve kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.

## Başvuru

Taleplerinizi {{eposta}} adresine e-posta göndererek veya {{telefon}} numaralı telefondan bize ulaşarak iletebilirsiniz. Başvurunuz en geç otuz gün içinde yanıtlanır.`,
  },
  {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    description: 'Ocean İnşaat web sitesinin ziyaretçi bilgilerini nasıl topladığı, kullandığı ve koruduğu hakkında gizlilik politikası.',
    updated: '2026-10-12',
    body: `Ocean İnşaat olarak ziyaretçilerimizin gizliliğine önem veriyoruz. Bu politika, oceaninsaat.com.tr adresindeki web sitemizi kullanırken hangi bilgilerin toplandığını ve nasıl kullanıldığını açıklar.

## Topladığımız bilgiler

- **Sizin paylaştıklarınız:** teklif ve iletişim formlarına yazdığınız ad, telefon, e-posta, konum ve talep bilgileri ile yüklediğiniz fotoğraflar.
- **Otomatik toplananlar:** izin vermeniz hâlinde, ziyaret edilen sayfalar ve cihaz türü gibi toplu istatistik verileri.

## Bilgileri nasıl kullanıyoruz

Paylaştığınız bilgiler yalnızca talebinizi değerlendirmek, sizinle iletişime geçmek ve hizmetimizi sunmak için kullanılır. İstatistik verileri, sitenin hangi bölümlerinin işe yaradığını anlamak ve siteyi geliştirmek için değerlendirilir.

## Bilgilerin korunması

Form verileri şifreli bağlantı (HTTPS) üzerinden iletilir. Talep kayıtlarına ve yüklenen fotoğraflara yalnızca yetkili çalışanlarımız, kimlik doğrulaması gerektiren yönetim paneli üzerinden erişebilir. Fotoğraflar herkese açık adreslerde tutulmaz.

## Üçüncü taraf bağlantıları

Sitemizde WhatsApp ve sosyal medya hesaplarına bağlantılar bulunur. Bu bağlantılara tıkladığınızda ilgili hizmetin kendi gizlilik koşulları geçerli olur.

## Haklarınız ve iletişim

Kişisel verilerinizle ilgili haklarınız için [KVKK Aydınlatma Metni](/kvkk-aydinlatma-metni)’ni inceleyebilir, sorularınızı {{eposta}} adresine iletebilirsiniz.`,
  },
  {
    slug: 'cerez-politikasi',
    title: 'Çerez Politikası',
    description: 'Ocean İnşaat web sitesinde kullanılan çerezler, tarayıcı depolaması ve tercihlerinizi nasıl yönetebileceğiniz hakkında bilgi.',
    updated: '2026-10-12',
    body: `Bu politika, oceaninsaat.com.tr web sitesinde kullanılan çerezleri ve benzeri teknolojileri açıklar.

## Zorunlu depolama

Sitenin çalışması için gerekli olan ve izin gerektirmeyen kayıtlar:

- **Çerez tercihi:** analitik çerezlere izin verip vermediğiniz bilgisi tarayıcınızda saklanır.
- **Teklif formu taslağı:** formu doldururken yaptığınız hizmet, daire tipi ve ilçe seçimleri, sayfa yenilendiğinde kaybolmaması için yalnızca o sekme oturumu boyunca tarayıcınızda tutulur. Ad, telefon ve e-posta bilgileriniz bu taslağa kaydedilmez.
- **Ziyaret kaynağı:** siteye hangi sayfadan veya kampanyadan geldiğiniz bilgisi sekme oturumu boyunca tutulur ve yalnızca teklif talebi gönderirseniz talebinize eklenir.

## Analitik çerezler

Ziyaret istatistiklerini ölçmek için Google Analytics kullanılabilir. Bu çerezler **yalnızca siz kabul ederseniz** yüklenir. Reddederseniz hiçbir analitik çerez yerleştirilmez ve site aynı şekilde çalışmaya devam eder.

## Tercihinizi değiştirme

Tercihinizi değiştirmek için tarayıcınızın site verilerini temizleyebilirsiniz; siteyi yeniden ziyaret ettiğinizde tercih penceresi tekrar gösterilir. Ayrıca tarayıcı ayarlarınızdan çerezleri tümüyle engelleyebilirsiniz.

## İletişim

Çerezlerle ilgili sorularınız için {{eposta}} adresine yazabilirsiniz.`,
  },
  {
    slug: 'kullanim-kosullari',
    title: 'Kullanım Koşulları',
    description: 'Ocean İnşaat web sitesinin kullanımına, sitedeki fiyat ve içeriklerin niteliğine ilişkin koşullar.',
    updated: '2026-10-12',
    body: `oceaninsaat.com.tr web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.

## Sitedeki bilgiler

Sitede yer alan hizmet açıklamaları, rehber yazıları ve görseller genel bilgilendirme amacı taşır. İçeriklerin güncel ve doğru olması için özen gösterilir; ancak her yapı ve daire farklı olduğundan, sitedeki bilgiler yerinde yapılacak değerlendirmenin yerini tutmaz.

## Fiyatlar ve teklifler

Sitede yayınlanan ev boyama paket fiyatları, ilan edilen başlangıç fiyatlarıdır ve tek başına bağlayıcı bir teklif niteliği taşımaz. İşin kapsamı ve nihai tutar, dairenin durumu değerlendirildikten sonra tarafınıza iletilen yazılı teklifle belirlenir. Ocean İnşaat ilan edilen fiyatları önceden bildirmeksizin güncelleyebilir; onaylanmış yazılı teklifler bundan etkilenmez.

## Teklif talepleri

Teklif formunu doldurmanız bir hizmet sözleşmesi kurmaz; yalnızca sizinle iletişime geçilmesi için talep oluşturur. Form aracılığıyla ilettiğiniz bilgilerin doğru olması sizin sorumluluğunuzdadır.

## Fikri mülkiyet

Sitedeki metinler, Ocean İnşaat logosu ve projelere ait görseller Ocean İnşaat’a aittir veya lisanslı olarak kullanılmaktadır. Yazılı izin olmaksızın ticari amaçla kopyalanamaz.

## Değişiklikler

Bu koşullar gerektiğinde güncellenebilir. Güncel metin her zaman bu sayfada yayınlanır.

## İletişim

Koşullarla ilgili sorularınız için {{eposta}} adresine yazabilir veya {{telefon}} numaralı telefondan bize ulaşabilirsiniz.`,
  },
];
