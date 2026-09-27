// Sample catalogue for development and demos (npm run seed:demo). Images are
// in ./demo-images. Prices are in paise.

const brands = ['Oakwood & Co', 'Rattan Republic', 'Sheesham House', 'Nordic Nest']

const rupees = (amount) => amount * 100

const products = [
    // Sofas
    { productName: 'Navy Velvet Loveseat', category: 'Sofas', brand: 'Nordic Nest', price: rupees(32999), image: 'p3.jpg',
      description: 'A compact two-seater in deep navy velvet with tapered walnut legs and two patterned cushions.' },
    { productName: 'Grey Sofa Cum Bed', category: 'Sofas', brand: 'Oakwood & Co', price: rupees(38500), image: 'sofa.jpg',
      description: 'Channel-stitched grey fabric sofa with a pull-out bed for guests.' },
    { productName: 'Low Platform Sofa', category: 'Sofas', brand: 'Nordic Nest', price: rupees(45999), image: 'img11.jpeg',
      description: 'A deep, modular grey sofa on a pale pine platform base. Seats three comfortably.' },
    { productName: 'Carved Sofa Cum Bed', category: 'Sofas', brand: 'Sheesham House', price: rupees(52000), image: 'img15.jpeg',
      description: 'Solid wood frame with carved side panels, cream cushions and a trundle that opens into a bed.' },
    { productName: 'Sheesham Sofa Cum Bed', category: 'Sofas', brand: 'Sheesham House', price: rupees(47500), image: 'img12.jpeg',
      description: 'Honey-finished sheesham with beige upholstery. Converts to a double bed in seconds.' },

    // Beds
    { productName: 'Espresso Sleigh Bed', category: 'Beds', brand: 'Oakwood & Co', price: rupees(58999), image: 'img24.jpeg',
      description: 'A curved sleigh headboard and footboard in a rich espresso finish. King size.' },
    { productName: 'Panelled King Bed', category: 'Beds', brand: 'Oakwood & Co', price: rupees(64500), image: 'img22.jpeg',
      description: 'Tall raised-panel headboard in dark walnut, with turned feet. A statement bed built to last.' },
    { productName: 'White Panel Queen Bed', category: 'Beds', brand: 'Nordic Nest', price: rupees(42000), image: 'img21.jpeg',
      description: 'Painted white panel headboard with a soft grey tone. Queen size.' },
    { productName: 'Upholstered Queen Bed', category: 'Beds', brand: 'Nordic Nest', price: rupees(36999), image: 'Queen.jpg',
      description: 'Button-tufted grey headboard on a slim black metal frame.' },
    { productName: 'Navy Upholstered Bed', category: 'Beds', brand: 'Nordic Nest', price: rupees(34500), image: 'img20.jpeg',
      description: 'Mid-century lines in navy fabric, with splayed wooden legs.' },
    { productName: 'Storage Sleigh Bed', category: 'Beds', brand: 'Oakwood & Co', price: rupees(61999), image: 'img23.jpeg',
      description: 'Sleigh headboard with two deep drawers in the footboard for linen and pillows.' },

    // Chairs
    { productName: 'Leather Seat Chair', category: 'Chairs', brand: 'Sheesham House', price: rupees(8999), image: 'p1.jpg',
      description: 'Solid wood frame with a tan leather seat and back. Works at a desk or a dining table.' },
    { productName: 'Rattan Egg Swing', category: 'Chairs', brand: 'Rattan Republic', price: rupees(18500), image: 'img4.jpeg',
      description: 'Hand-woven natural rattan egg chair on a powder-coated stand, with a plush seat cushion.' },
    { productName: 'Cocoon Hanging Chair', category: 'Chairs', brand: 'Rattan Republic', price: rupees(21999), image: 'img7.jpeg',
      description: 'A teardrop cocoon in white wicker, lined with cushions. Hangs from a ceiling hook.' },
    { productName: 'Wicker Pod Chair', category: 'Chairs', brand: 'Rattan Republic', price: rupees(26500), image: 'img6.jpeg',
      description: 'An outdoor-ready pod in woven resin wicker with a deep cushioned seat.' },

    // Arm chairs
    { productName: 'Mustard Mid-Century Armchair', category: 'Arm Chairs', brand: 'Nordic Nest', price: rupees(16999), image: 'p5.jpg',
      description: 'Button-back armchair in mustard fabric on tapered wooden legs. A cheerful reading corner.' },

    // Dining sets
    { productName: 'Six-Seater Dining Set with Bench', category: 'Dining Sets', brand: 'Sheesham House', price: rupees(54999), image: 'img19.jpeg',
      description: 'Rectangular table, four slat-back chairs and a bench, all in warm walnut.' },
    { productName: 'Four-Seater Dining Set', category: 'Dining Sets', brand: 'Sheesham House', price: rupees(32500), image: 'img18.jpeg',
      description: 'A compact rectangular table with four ladder-back chairs. Seats four for everyday meals.' },
    { productName: 'Round Scandinavian Dining Set', category: 'Dining Sets', brand: 'Nordic Nest', price: rupees(27999), image: 'img17.jpeg',
      description: 'White round table with four moulded chairs on beech legs.' },

    // Dressers
    { productName: 'Oak Dressing Table with Stool', category: 'Dressers', brand: 'Oakwood & Co', price: rupees(19500), image: 'img25.jpeg',
      description: 'Light oak vanity with a mirror, drawers and a matching stool.' },
]

module.exports = { brands, products }
