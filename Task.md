# Gefter Web APP

This application is responsible for generate quote/budget for Kitchen/Bathroom shapes, to generate the budget the user has to follow a flow through the application, being it at the most times the same flow: 

## 1. HomePage
## 2. Layout Selection
The user can select more than one shape, and the user can select one or more times only one shape, Ex: 1 - LShape, 2- UShape OR 1 - LShape, 2 - LShape
## 3. Measurements Page
After the user has selected the desired shapes, the measurements page must render in the order of the selected shapes, by having this behavior if the user has selected 2 shapes: LShape and UShape;  the measures page must render dynamically these two shapes, first LShape, and after filling required measures then go to UShape.

On measurements page there is also two more rules ad behavior that the app must follow: 
### 1. When the user types the value for a specific measure, the SVG rendered must have the label text value changed so the user can see exactly where he is setting the measure, got it? 
### 2. On this screen, right after every measure field there is need to have a "Wall Toogle", so the user can identify which measures are in contact with the walls.
### 3. On this screen there is need to have also a "BackSplash" toogle so the user can add measures for the backsplash.

OBS: The Shapes, images, fields are being taken from database, in section "Database Schema & Data Model" I will paste the current database structure so you can see it.

## 4. Materials Selection Page
Here the user will just select the materials for all shapes he has selected, the user must select only ONE material it will be applied for all selected shapes

## 5. Edge Selection Page
Here the user will select the edges for the selected shapes, here there is a super important rule that is: the edged can be only applied for measures that ARE NOT walls.

Pages 6 and ahead we will implement later.

## 📊 **Database Schema & Data Model**

### **Core Tables**

#### **Layouts Table**
```sql
- id: String (Primary Key)
- name: String (Layout name)
- description: String (Optional description)
- layout_image: String (Image URL)
- layout_type: String (Layout category)
- svg_template_name: String (SVG template reference)
- is_active: Boolean (Active status)
- sort_order: Integer (Display order)
- supports_backsplash: Boolean (Backsplash support)
- supports_sink: Boolean (Sink support)
- supports_wall_toggle: Boolean (Wall toggle support)
```

#### **Layout Fields Table**
```sql
- id: String (Primary Key)
- layout_id: String (Foreign Key to layouts)
- field_name: String (Field identifier)
- field_label: String (Display label)
- svg_id: String (SVG element ID)
- field_type: String (Input type)
- data_type: String (Data validation type)
- unit_type: String (Measurement unit)
- is_required: Boolean (Required field)
- is_visible: Boolean (Field visibility)
- sort_order: Integer (Display order)
- validation_rules: JSON (Validation configuration)
```

#### **Auto-Calculation Rules Table**
```sql
- id: String (Primary Key)
- layout_id: String (Foreign Key to layouts)
- target_field_name: String (Calculated field)
- formula: String (Calculation formula)
- description: String (Rule description)
- is_active: Boolean (Active status)
- sort_order: Integer (Execution order)
```

#### **Materials Table**
```sql
- id: String (Primary Key)
- supplier_id: String (Supplier reference)
- name: String (Material name)
- brand: String (Brand name)
- color: String (Color description)
- variation: String (Variation details)
- thickness: Double (Material thickness)
- price_per_sqft: Double (Price per square foot)
- image: String (Material image URL)
- desc_curta: String (Short description)
- desc_longa: String (Long description)
- product: String (Product details)
- seamns: String (Seam information)
- surface: String (Surface details)
- finish: String (Finish information)
- care: String (Care instructions)
- seal: String (Sealing information)
- warranty: String (Warranty details)
- vendor: String (Vendor information)
```

#### **Quotes & Quote Items Tables**
```sql
-- Quotes Table
- id: String (Primary Key)
- lead_id: String (Lead reference)
- total_price: Double (Total quote price)
- layout_id: String (Layout reference)
- material_id: String (Material reference)

-- Quote Items Table
- id: String (Primary Key)
- quote_id: String (Foreign Key to quotes)
- material_id: String (Material reference)
- width_ft: Double (Width in feet)
- length_ft: Double (Length in feet)
- area_sqft: Double (Calculated area)
- subtotal: Double (Item subtotal)
- layout_id: String (Layout reference)
```

#### **Supporting Tables**
- **Field Dependencies**: Defines field relationships and dependencies
- **Layout Field Groups**: Groups fields for UI organization
- **Field Group Assignments**: Links fields to groups
- **Users**: User authentication and profile data
- **Leads**: Lead management and tracking
- **Suppliers**: Supplier information
- **Notifications**: System notifications

---


## 🔧 **Key Features & Functionality**

### **Dynamic Field System**
- **Database-Driven**: Field definitions stored in database
- **Auto-Calculation**: Automatic computation of derived measurements
- **Validation**: Real-time field validation
- **Grouping**: Logical field grouping for UI organization

### **Multi-Shape Support**
- **Shape Types**: L-Shape, U-Shape, Island, Straight, Angled, etc.
- **Instance Management**: Multiple instances of same shape type
- **Per-Shape Flow**: Complete each shape before moving to next
- **Progress Tracking**: Visual progress indication

### **Auto-Calculation Engine**
- **Formula-Based**: Mathematical formulas for derived measurements
- **Dependency Tracking**: Field dependency management
- **Real-Time Updates**: Immediate calculation updates
- **Error Handling**: Validation and error reporting

### **Pricing System**
- **Material-Based**: Price per square foot calculations
- **Edge Pricing**: Linear foot pricing for edges
- **Additional Features**: Backsplash, sink, cooktop pricing
- **Total Computation**: Automatic total calculation

### **SVG Rendering System**
- **Template-Based**: SVG templates for each layout
- **Dynamic Updates**: Real-time measurement overlay
- **Caching**: Performance optimization through caching
- **Cross-Platform**: Web and mobile support