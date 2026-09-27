// Fixed ids keep references stable across resets. The Customer and Vendor
// ids are hard-coded in the current CRA client's Register page.
const roles = [
    { _id: '646afa55a201bba44448c941', name: 'Admin' },
    { _id: '646afa4fa201bba44448c943', name: 'Vendor' },
    { _id: '646afa59a201bba44448c945', name: 'Customer' },
]

const categories = ['Sofas', 'Beds', 'Chairs', 'Arm Chairs', 'Tables', 'Dining Sets', 'Dressers', 'Wardrobes']

module.exports = { roles, categories }
