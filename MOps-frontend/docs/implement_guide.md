# MAINTENOPS - MATERIAL-BASED QUOTATION SYSTEM
## Implementation Guide for AI Assistant

---

## 🎯 OBJECTIVE

Transform the quotation system from manual text entry to a **structured material-based system** with:
- Material picker with specifications
- Auto-calculated costs
- Auto-generated descriptions
- Inventory checking
- Automated vendor list generation

---

## 📊 DATABASE SCHEMA

### **1. Materials Master Table**
```sql
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50), -- Material, Labor, Hardware
    default_unit VARCHAR(20) NOT NULL, -- piece, kg, litre, sqft, meter, job
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id INT REFERENCES users(id)
);

-- Seed data
INSERT INTO materials (name, category, default_unit) VALUES
('Ply', 'Material', 'sqft'),
('Sunmica', 'Material', 'sheet'),
('Fevicol', 'Material', 'bottle'),
('Iron Nails', 'Hardware', 'kg'),
('Labor Charges', 'Labor', 'job'),
('Paint', 'Material', 'litre'),
('Screws', 'Hardware', 'packet'),
('Sandpaper', 'Hardware', 'sheet'),
('Wood Polish', 'Material', 'litre'),
('Hinges', 'Hardware', 'piece');

CREATE INDEX idx_materials_name ON materials(name);
CREATE INDEX idx_materials_active ON materials(is_active);
```

### **2. Material Specifications Table**
```sql
CREATE TABLE material_specifications (
    id SERIAL PRIMARY KEY,
    material_id INT REFERENCES materials(id) ON DELETE CASCADE,
    specification VARCHAR(100) NOT NULL, -- 8mm, 9mm, Premium, Standard, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed data
INSERT INTO material_specifications (material_id, specification) VALUES
((SELECT id FROM materials WHERE name = 'Ply'), '6mm'),
((SELECT id FROM materials WHERE name = 'Ply'), '8mm'),
((SELECT id FROM materials WHERE name = 'Ply'), '9mm'),
((SELECT id FROM materials WHERE name = 'Ply'), '12mm'),
((SELECT id FROM materials WHERE name = 'Sunmica'), 'Standard'),
((SELECT id FROM materials WHERE name = 'Sunmica'), 'Premium'),
((SELECT id FROM materials WHERE name = 'Sunmica'), 'Designer'),
((SELECT id FROM materials WHERE name = 'Fevicol'), '500ml'),
((SELECT id FROM materials WHERE name = 'Fevicol'), '1kg'),
((SELECT id FROM materials WHERE name = 'Iron Nails'), '1 inch'),
((SELECT id FROM materials WHERE name = 'Iron Nails'), '2 inch'),
((SELECT id FROM materials WHERE name = 'Labor Charges'), 'Carpentry'),
((SELECT id FROM materials WHERE name = 'Labor Charges'), 'Electrical'),
((SELECT id FROM materials WHERE name = 'Labor Charges'), 'Welding');

CREATE INDEX idx_material_specs_material ON material_specifications(material_id);
```

### **3. Vendors Table**
```sql
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(15),
    email VARCHAR(100),
    address TEXT,
    gst_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed data
INSERT INTO vendors (name, contact_person, phone, email) VALUES
('Vendor A - Timber Supplies', 'Ramesh Kumar', '9876543210', 'ramesh@vendora.com'),
('Vendor B - Hardware Store', 'Suresh Patil', '9876543211', 'suresh@vendorb.com'),
('Vendor C - Paints & Polish', 'Mahesh Shah', '9876543212', 'mahesh@vendorc.com');

CREATE INDEX idx_vendors_active ON vendors(is_active);
```

### **4. Material-Vendor Mapping (Many-to-Many)**
```sql
CREATE TABLE material_vendors (
    id SERIAL PRIMARY KEY,
    material_id INT REFERENCES materials(id) ON DELETE CASCADE,
    vendor_id INT REFERENCES vendors(id) ON DELETE CASCADE,
    is_preferred BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(material_id, vendor_id)
);

-- Seed data - Map materials to vendors
INSERT INTO material_vendors (material_id, vendor_id, is_preferred) VALUES
((SELECT id FROM materials WHERE name = 'Ply'), (SELECT id FROM vendors WHERE name LIKE 'Vendor A%'), true),
((SELECT id FROM materials WHERE name = 'Ply'), (SELECT id FROM vendors WHERE name LIKE 'Vendor B%'), false),
((SELECT id FROM materials WHERE name = 'Sunmica'), (SELECT id FROM vendors WHERE name LIKE 'Vendor A%'), true),
((SELECT id FROM materials WHERE name = 'Fevicol'), (SELECT id FROM vendors WHERE name LIKE 'Vendor B%'), true),
((SELECT id FROM materials WHERE name = 'Iron Nails'), (SELECT id FROM vendors WHERE name LIKE 'Vendor B%'), true),
((SELECT id FROM materials WHERE name = 'Paint'), (SELECT id FROM vendors WHERE name LIKE 'Vendor C%'), true),
((SELECT id FROM materials WHERE name = 'Wood Polish'), (SELECT id FROM vendors WHERE name LIKE 'Vendor C%'), true);

CREATE INDEX idx_material_vendors_material ON material_vendors(material_id);
CREATE INDEX idx_material_vendors_vendor ON material_vendors(vendor_id);
```

### **5. Material Rate History**
```sql
CREATE TABLE material_rate_history (
    id SERIAL PRIMARY KEY,
    material_id INT REFERENCES materials(id),
    specification_id INT REFERENCES material_specifications(id),
    vendor_id INT REFERENCES vendors(id),
    rate DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    recorded_by_user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed some initial rates
INSERT INTO material_rate_history (material_id, specification_id, vendor_id, rate, purchase_date) VALUES
((SELECT id FROM materials WHERE name = 'Ply'), 
 (SELECT id FROM material_specifications WHERE specification = '8mm'), 
 (SELECT id FROM vendors WHERE name LIKE 'Vendor A%'), 
 150.00, '2025-01-15'),
((SELECT id FROM materials WHERE name = 'Ply'), 
 (SELECT id FROM material_specifications WHERE specification = '6mm'), 
 (SELECT id FROM vendors WHERE name LIKE 'Vendor A%'), 
 120.00, '2025-02-01'),
((SELECT id FROM materials WHERE name = 'Sunmica'), 
 (SELECT id FROM material_specifications WHERE specification = 'Premium'), 
 (SELECT id FROM vendors WHERE name LIKE 'Vendor A%'), 
 400.00, '2025-01-20'),
((SELECT id FROM materials WHERE name = 'Sunmica'), 
 (SELECT id FROM material_specifications WHERE specification = 'Standard'), 
 (SELECT id FROM vendors WHERE name LIKE 'Vendor A%'), 
 300.00, '2025-02-05'),
((SELECT id FROM materials WHERE name = 'Fevicol'), 
 (SELECT id FROM material_specifications WHERE specification = '1kg'), 
 (SELECT id FROM vendors WHERE name LIKE 'Vendor B%'), 
 180.00, '2025-02-01');

CREATE INDEX idx_rate_history_material ON material_rate_history(material_id);
CREATE INDEX idx_rate_history_date ON material_rate_history(purchase_date DESC);
```

### **6. Inventory (Godown Stock)**
```sql
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    material_id INT REFERENCES materials(id),
    specification_id INT REFERENCES material_specifications(id),
    quantity_available DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL, -- From materials.default_unit
    last_updated TIMESTAMP DEFAULT NOW(),
    updated_by_user_id INT REFERENCES users(id),
    UNIQUE(material_id, specification_id)
);

-- Seed some initial inventory
INSERT INTO inventory (material_id, specification_id, quantity_available, unit) VALUES
((SELECT id FROM materials WHERE name = 'Ply'), 
 (SELECT id FROM material_specifications WHERE specification = '8mm'), 
 25.0, 'sqft'),
((SELECT id FROM materials WHERE name = 'Fevicol'), 
 (SELECT id FROM material_specifications WHERE specification = '1kg'), 
 5.0, 'bottle'),
((SELECT id FROM materials WHERE name = 'Iron Nails'), 
 (SELECT id FROM material_specifications WHERE specification = '2 inch'), 
 10.0, 'kg');

CREATE INDEX idx_inventory_material ON inventory(material_id);
```

### **7. Request Materials (Quotation Line Items)**
```sql
CREATE TABLE request_materials (
    id SERIAL PRIMARY KEY,
    request_id INT REFERENCES requests(id) ON DELETE CASCADE,
    material_id INT REFERENCES materials(id),
    specification_id INT REFERENCES material_specifications(id),
    
    -- Denormalized for history preservation
    material_name VARCHAR(100) NOT NULL,
    specification VARCHAR(100),
    
    quantity_required DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL, -- Price snapshot at quotation time
    total_price DECIMAL(10, 2) NOT NULL, -- quantity * unit_price
    
    vendor_id INT REFERENCES vendors(id),
    vendor_name VARCHAR(100), -- Denormalized
    
    status VARCHAR(50) DEFAULT 'PENDING_PURCHASE', 
    -- Status values: PENDING_PURCHASE, FROM_STOCK, PURCHASED, FULFILLED
    
    last_purchase_rate DECIMAL(10, 2), -- Reference for SA
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_request_materials_request ON request_materials(request_id);
CREATE INDEX idx_request_materials_status ON request_materials(status);
CREATE INDEX idx_request_materials_vendor ON request_materials(vendor_id);
```

### **8. Update Requests Table**
```sql
-- Add new fields to existing requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS total_estimated_cost DECIMAL(10, 2);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS quotation_description TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS estimated_days INT;

-- Add new status values while keeping existing ones
-- SUBMITTED, PENDING_SA_APPROVAL, APPROVED (existing)
-- Add: QUOTATION_SENT, NEGOTIATION_PENDING, QUOTATION_REVISED, 
--      VENDOR_LIST_PREPARED, ITEMS_PURCHASED, IN_PRODUCTION, 
--      READY_FOR_COLLECTION, PAYMENT_RECEIVED, COMPLETED, REJECTED, CANCELLED
```

### **9. Vendor Purchase Lists**
```sql
CREATE TABLE vendor_purchase_lists (
    id SERIAL PRIMARY KEY,
    vendor_id INT REFERENCES vendors(id),
    material_id INT REFERENCES materials(id),
    specification_id INT REFERENCES material_specifications(id),
    
    -- Denormalized
    material_name VARCHAR(100),
    specification VARCHAR(100),
    
    total_quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20),
    
    list_date DATE DEFAULT CURRENT_DATE,
    is_purchased BOOLEAN DEFAULT false,
    purchased_at TIMESTAMP,
    invoice_url VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendor_lists_vendor ON vendor_purchase_lists(vendor_id);
CREATE INDEX idx_vendor_lists_purchased ON vendor_purchase_lists(is_purchased);
```

---

## 🔧 BACKEND IMPLEMENTATION (Spring Boot)

### **1. Entity Models**

#### Material.java
```java
package com.maintenops.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "materials")
@Data
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    private String category; // Material, Labor, Hardware
    
    @Column(name = "default_unit", nullable = false)
    private String defaultUnit;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "created_by_user_id")
    private Long createdByUserId;
    
    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL)
    private List<MaterialSpecification> specifications;
}
```

#### MaterialSpecification.java
```java
package com.maintenops.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "material_specifications")
@Data
public class MaterialSpecification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;
    
    @Column(nullable = false)
    private String specification;
    
    private String description;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

#### Vendor.java
```java
package com.maintenops.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendors")
@Data
public class Vendor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "contact_person")
    private String contactPerson;
    
    private String phone;
    private String email;
    private String address;
    
    @Column(name = "gst_number")
    private String gstNumber;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

#### MaterialVendor.java
```java
package com.maintenops.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "material_vendors")
@Data
public class MaterialVendor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;
    
    @Column(name = "is_preferred")
    private Boolean isPreferred = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

#### Inventory.java
```java
package com.maintenops.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Data
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;
    
    @ManyToOne
    @JoinColumn(name = "specification_id")
    private MaterialSpecification specification;
    
    @Column(name = "quantity_available", nullable = false)
    private BigDecimal quantityAvailable = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private String unit;
    
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated = LocalDateTime.now();
    
    @Column(name = "updated_by_user_id")
    private Long updatedByUserId;
}
```

#### RequestMaterial.java
```java
package com.maintenops.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "request_materials")
@Data
public class RequestMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "request_id", nullable = false)
    private Request request;
    
    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;
    
    @ManyToOne
    @JoinColumn(name = "specification_id")
    private MaterialSpecification specification;
    
    // Denormalized for history
    @Column(name = "material_name", nullable = false)
    private String materialName;
    
    private String specificationText;
    
    @Column(name = "quantity_required", nullable = false)
    private BigDecimal quantityRequired;
    
    @Column(nullable = false)
    private String unit;
    
    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;
    
    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;
    
    @Column(name = "vendor_name")
    private String vendorName;
    
    @Column(nullable = false)
    private String status = "PENDING_PURCHASE";
    // PENDING_PURCHASE, FROM_STOCK, PURCHASED, FULFILLED
    
    @Column(name = "last_purchase_rate")
    private BigDecimal lastPurchaseRate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

### **2. Repositories**

```java
package com.maintenops.repository;

import com.maintenops.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByIsActiveTrue();
    Optional<Material> findByNameIgnoreCase(String name);
    
    @Query("SELECT m FROM Material m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) AND m.isActive = true")
    List<Material> searchByName(@Param("query") String query);
}

public interface MaterialSpecificationRepository extends JpaRepository<MaterialSpecification, Long> {
    List<MaterialSpecification> findByMaterialIdAndIsActiveTrue(Long materialId);
    
    @Query("SELECT ms FROM MaterialSpecification ms WHERE ms.material.id = :materialId AND LOWER(ms.specification) = LOWER(:spec)")
    Optional<MaterialSpecification> findByMaterialAndSpec(@Param("materialId") Long materialId, @Param("spec") String spec);
}

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByIsActiveTrue();
}

public interface MaterialVendorRepository extends JpaRepository<MaterialVendor, Long> {
    List<MaterialVendor> findByMaterialId(Long materialId);
    
    @Query("SELECT mv FROM MaterialVendor mv WHERE mv.material.id = :materialId AND mv.isPreferred = true")
    Optional<MaterialVendor> findPreferredVendor(@Param("materialId") Long materialId);
}

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    @Query("SELECT i FROM Inventory i WHERE i.material.id = :materialId AND i.specification.id = :specId")
    Optional<Inventory> findByMaterialAndSpec(@Param("materialId") Long materialId, @Param("specId") Long specId);
}

public interface MaterialRateHistoryRepository extends JpaRepository<MaterialRateHistory, Long> {
    @Query("SELECT mrh FROM MaterialRateHistory mrh WHERE mrh.material.id = :materialId AND mrh.specification.id = :specId ORDER BY mrh.purchaseDate DESC LIMIT 1")
    Optional<MaterialRateHistory> findLatestRate(@Param("materialId") Long materialId, @Param("specId") Long specId);
}

public interface RequestMaterialRepository extends JpaRepository<RequestMaterial, Long> {
    List<RequestMaterial> findByRequestId(Long requestId);
    
    @Query("SELECT rm FROM RequestMaterial rm WHERE rm.status = 'PENDING_PURCHASE'")
    List<RequestMaterial> findPendingPurchases();
}
```

### **3. DTOs**

```java
package com.maintenops.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class QuotationRequestDTO {
    private Long requestId;
    private List<MaterialItemDTO> materials;
    private Integer estimatedDays;
    private String remarks;
}

@Data
public class MaterialItemDTO {
    private Long materialId;
    private Long specificationId;
    private BigDecimal quantity;
    private Long vendorId;
    private BigDecimal unitPrice; // SA can override
}

@Data
public class QuotationResponseDTO {
    private Long requestId;
    private String requestNumber;
    private BigDecimal totalCost;
    private String quotationDescription;
    private List<MaterialLineItemDTO> materials;
    private Integer estimatedDays;
}

@Data
public class MaterialLineItemDTO {
    private Long id;
    private String materialName;
    private String specification;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String vendorName;
    private BigDecimal lastPurchaseRate;
    private String status;
}

@Data
public class MaterialSearchDTO {
    private Long materialId;
    private String materialName;
    private String category;
    private String defaultUnit;
    private List<SpecificationDTO> specifications;
    private List<VendorDTO> vendors;
    private BigDecimal lastPurchaseRate;
}

@Data
public class SpecificationDTO {
    private Long id;
    private String specification;
    private String description;
}

@Data
public class VendorDTO {
    private Long id;
    private String name;
    private Boolean isPreferred;
}

@Data
public class InventoryCheckDTO {
    private Long materialId;
    private Long specificationId;
    private BigDecimal requiredQuantity;
    private BigDecimal availableQuantity;
    private BigDecimal shortfall;
    private String status; // SUFFICIENT, INSUFFICIENT, NOT_AVAILABLE
}
```

### **4. Service Layer**

#### QuotationService.java
```java
package com.maintenops.service;

import com.maintenops.dto.*;
import com.maintenops.entity.*;
import com.maintenops.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotationService {
    
    private final RequestRepository requestRepo;
    private final MaterialRepository materialRepo;
    private final MaterialSpecificationRepository specRepo;
    private final VendorRepository vendorRepo;
    private final MaterialRateHistoryRepository rateHistoryRepo;
    private final RequestMaterialRepository requestMaterialRepo;
    private final InventoryRepository inventoryRepo;
    
    @Transactional
    public QuotationResponseDTO createQuotation(QuotationRequestDTO dto) {
        Request request = requestRepo.findById(dto.getRequestId())
            .orElseThrow(() -> new RuntimeException("Request not found"));
        
        List<RequestMaterial> requestMaterials = new ArrayList<>();
        BigDecimal totalCost = BigDecimal.ZERO;
        StringBuilder descriptionBuilder = new StringBuilder();
        
        for (MaterialItemDTO item : dto.getMaterials()) {
            Material material = materialRepo.findById(item.getMaterialId())
                .orElseThrow(() -> new RuntimeException("Material not found"));
            
            MaterialSpecification spec = specRepo.findById(item.getSpecificationId())
                .orElse(null);
            
            Vendor vendor = vendorRepo.findById(item.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
            
            // Get last purchase rate for reference
            BigDecimal lastRate = rateHistoryRepo
                .findLatestRate(material.getId(), spec != null ? spec.getId() : null)
                .map(MaterialRateHistory::getRate)
                .orElse(null);
            
            // Use SA-provided price or last rate
            BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : lastRate;
            BigDecimal itemTotal = item.getQuantity().multiply(unitPrice);
            
            // Create request material
            RequestMaterial rm = new RequestMaterial();
            rm.setRequest(request);
            rm.setMaterial(material);
            rm.setSpecification(spec);
            rm.setMaterialName(material.getName());
            rm.setSpecificationText(spec != null ? spec.getSpecification() : null);
            rm.setQuantityRequired(item.getQuantity());
            rm.setUnit(material.getDefaultUnit());
            rm.setUnitPrice(unitPrice);
            rm.setTotalPrice(itemTotal);
            rm.setVendor(vendor);
            rm.setVendorName(vendor.getName());
            rm.setLastPurchaseRate(lastRate);
            rm.setStatus("PENDING_PURCHASE");
            
            requestMaterials.add(rm);
            totalCost = totalCost.add(itemTotal);
            
            // Build description
            descriptionBuilder.append(material.getName());
            if (spec != null) {
                descriptionBuilder.append(" (").append(spec.getSpecification()).append(")");
            }
            descriptionBuilder.append(" x").append(item.getQuantity());
            descriptionBuilder.append(", ");
        }
        
        // Save all materials
        requestMaterialRepo.saveAll(requestMaterials);
        
        // Update request
        String description = descriptionBuilder.toString();
        if (description.endsWith(", ")) {
            description = description.substring(0, description.length() - 2);
        }
        
        request.setTotalEstimatedCost(totalCost);
        request.setQuotationDescription(description);
        request.setEstimatedDays(dto.getEstimatedDays());
        request.setStatus("PENDING_SA_APPROVAL"); // For SA approval
        requestRepo.save(request);
        
        // Build response
        QuotationResponseDTO response = new QuotationResponseDTO();
        response.setRequestId(request.getId());
        response.setRequestNumber(request.getRequestNumber());
        response.setTotalCost(totalCost);
        response.setQuotationDescription(description);
        response.setEstimatedDays(dto.getEstimatedDays());
        response.setMaterials(requestMaterials.stream()
            .map(this::toLineItemDTO)
            .collect(Collectors.toList()));
        
        return response;
    }
    
    public List<InventoryCheckDTO> checkInventory(Long requestId) {
        List<RequestMaterial> materials = requestMaterialRepo.findByRequestId(requestId);
        List<InventoryCheckDTO> checks = new ArrayList<>();
        
        for (RequestMaterial rm : materials) {
            InventoryCheckDTO check = new InventoryCheckDTO();
            check.setMaterialId(rm.getMaterial().getId());
            check.setSpecificationId(rm.getSpecification() != null ? rm.getSpecification().getId() : null);
            check.setRequiredQuantity(rm.getQuantityRequired());
            
            Inventory inventory = inventoryRepo.findByMaterialAndSpec(
                rm.getMaterial().getId(),
                rm.getSpecification() != null ? rm.getSpecification().getId() : null
            ).orElse(null);
            
            if (inventory != null) {
                check.setAvailableQuantity(inventory.getQuantityAvailable());
                BigDecimal shortfall = rm.getQuantityRequired().subtract(inventory.getQuantityAvailable());
                check.setShortfall(shortfall.max(BigDecimal.ZERO));
                
                if (inventory.getQuantityAvailable().compareTo(rm.getQuantityRequired()) >= 0) {
                    check.setStatus("SUFFICIENT");
                } else if (inventory.getQuantityAvailable().compareTo(BigDecimal.ZERO) > 0) {
                    check.setStatus("INSUFFICIENT");
                } else {
                    check.setStatus("NOT_AVAILABLE");
                }
            } else {
                check.setAvailableQuantity(BigDecimal.ZERO);
                check.setShortfall(rm.getQuantityRequired());
                check.setStatus("NOT_AVAILABLE");
            }
            
            checks.add(check);
        }
        
        return checks;
    }
    
    @Transactional
    public void processApprovedQuotation(Long requestId) {
        Request request = requestRepo.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        
        List<RequestMaterial> materials = requestMaterialRepo.findByRequestId(requestId);
        
        for (RequestMaterial rm : materials) {
            Inventory inventory = inventoryRepo.findByMaterialAndSpec(
                rm.getMaterial().getId(),
                rm.getSpecification() != null ? rm.getSpecification().getId() : null
            ).orElse(null);
            
            if (inventory != null && inventory.getQuantityAvailable().compareTo(rm.getQuantityRequired()) >= 0) {
                // Deduct from stock
                inventory.setQuantityAvailable(
                    inventory.getQuantityAvailable().subtract(rm.getQuantityRequired())
                );
                inventoryRepo.save(inventory);
                
                // Mark as from stock
                rm.setStatus("FROM_STOCK");
            } else {
                // Calculate shortfall
                BigDecimal shortfall = rm.getQuantityRequired();
                if (inventory != null && inventory.getQuantityAvailable().compareTo(BigDecimal.ZERO) > 0) {
                    shortfall = rm.getQuantityRequired().subtract(inventory.getQuantityAvailable());
                    inventory.setQuantityAvailable(BigDecimal.ZERO);
                    inventoryRepo.save(inventory);
                }
                
                // Keep as PENDING_PURCHASE (will be in vendor list)
                rm.setStatus("PENDING_PURCHASE");
            }
            
            requestMaterialRepo.save(rm);
        }
        
        request.setStatus("APPROVED");
        requestRepo.save(request);
    }
    
    private MaterialLineItemDTO toLineItemDTO(RequestMaterial rm) {
        MaterialLineItemDTO dto = new MaterialLineItemDTO();
        dto.setId(rm.getId());
        dto.setMaterialName(rm.getMaterialName());
        dto.setSpecification(rm.getSpecificationText());
        dto.setQuantity(rm.getQuantityRequired());
        dto.setUnit(rm.getUnit());
        dto.setUnitPrice(rm.getUnitPrice());
        dto.setTotalPrice(rm.getTotalPrice());
        dto.setVendorName(rm.getVendorName());
        dto.setLastPurchaseRate(rm.getLastPurchaseRate());
        dto.setStatus(rm.getStatus());
        return dto;
    }
}
```

#### MaterialService.java
```java
package com.maintenops.service;

import com.maintenops.dto.*;
import com.maintenops.entity.*;
import com.maintenops.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialService {
    
    private final MaterialRepository materialRepo;
    private final MaterialSpecificationRepository specRepo;
    private final MaterialVendorRepository materialVendorRepo;
    private final MaterialRateHistoryRepository rateHistoryRepo;
    
    public List<MaterialSearchDTO> searchMaterials(String query) {
        List<Material> materials = query != null && !query.isEmpty()
            ? materialRepo.searchByName(query)
            : materialRepo.findByIsActiveTrue();
        
        return materials.stream()
            .map(this::toSearchDTO)
            .collect(Collectors.toList());
    }
    
    public MaterialSearchDTO getMaterialDetails(Long materialId) {
        Material material = materialRepo.findById(materialId)
            .orElseThrow(() -> new RuntimeException("Material not found"));
        
        return toSearchDTO(material);
    }
    
    private MaterialSearchDTO toSearchDTO(Material material) {
        MaterialSearchDTO dto = new MaterialSearchDTO();
        dto.setMaterialId(material.getId());
        dto.setMaterialName(material.getName());
        dto.setCategory(material.getCategory());
        dto.setDefaultUnit(material.getDefaultUnit());
        
        // Get specifications
        List<MaterialSpecification> specs = specRepo.findByMaterialIdAndIsActiveTrue(material.getId());
        dto.setSpecifications(specs.stream()
            .map(spec -> {
                SpecificationDTO s = new SpecificationDTO();
                s.setId(spec.getId());
                s.setSpecification(spec.getSpecification());
                s.setDescription(spec.getDescription());
                return s;
            })
            .collect(Collectors.toList()));
        
        // Get vendors
        List<MaterialVendor> materialVendors = materialVendorRepo.findByMaterialId(material.getId());
        dto.setVendors(materialVendors.stream()
            .map(mv -> {
                VendorDTO v = new VendorDTO();
                v.setId(mv.getVendor().getId());
                v.setName(mv.getVendor().getName());
                v.setIsPreferred(mv.getIsPreferred());
                return v;
            })
            .collect(Collectors.toList()));
        
        return dto;
    }
}
```

### **5. Controllers**

```java
package com.maintenops.controller;

import com.maintenops.dto.*;
import com.maintenops.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {
    
    private final MaterialService materialService;
    
    @GetMapping("/search")
    public ResponseEntity<List<MaterialSearchDTO>> searchMaterials(
        @RequestParam(required = false) String query
    ) {
        return ResponseEntity.ok(materialService.searchMaterials(query));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MaterialSearchDTO> getMaterialDetails(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getMaterialDetails(id));
    }
}

@RestController
@RequestMapping("/api/quotations")
@RequiredArgsConstructor
public class QuotationController {
    
    private final QuotationService quotationService;
    
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<QuotationResponseDTO> createQuotation(
        @RequestBody QuotationRequestDTO dto
    ) {
        return ResponseEntity.ok(quotationService.createQuotation(dto));
    }
    
    @GetMapping("/{requestId}/inventory-check")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<InventoryCheckDTO>> checkInventory(
        @PathVariable Long requestId
    ) {
        return ResponseEntity.ok(quotationService.checkInventory(requestId));
    }
    
    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> approveQuotation(@PathVariable Long requestId) {
        quotationService.processApprovedQuotation(requestId);
        return ResponseEntity.ok("Quotation approved and inventory processed");
    }
}
```

---

## 🎨 FRONTEND IMPLEMENTATION (React + TypeScript)

### **1. Material Picker Component**

```typescript
// components/MaterialPicker.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Material {
  id: number;
  name: string;
  category: string;
  defaultUnit: string;
  specifications: Specification[];
  vendors: Vendor[];
}

interface Specification {
  id: number;
  specification: string;
}

interface Vendor {
  id: number;
  name: string;
  isPreferred: boolean;
}

interface MaterialItem {
  materialId: number;
  materialName: string;
  specificationId: number;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vendorId: number;
  vendorName: string;
  lastPurchaseRate?: number;
  total: number;
}

interface MaterialPickerProps {
  requestId: number;
  onMaterialsChange: (materials: MaterialItem[], totalCost: number, description: string) => void;
}

export const MaterialPicker: React.FC<MaterialPickerProps> = ({ requestId, onMaterialsChange }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    materialId: 0,
    specificationId: 0,
    quantity: 0,
    vendorId: 0,
    unitPrice: 0
  });
  const [selectedMaterialDetails, setSelectedMaterialDetails] = useState<Material | null>(null);

  useEffect(() => {
    // Fetch materials on mount
    fetchMaterials();
  }, []);

  useEffect(() => {
    // Calculate and notify parent when materials change
    const totalCost = selectedMaterials.reduce((sum, item) => sum + item.total, 0);
    const description = selectedMaterials
      .map(m => `${m.materialName} ${m.specification ? `(${m.specification})` : ''} x${m.quantity}`)
      .join(', ');
    
    onMaterialsChange(selectedMaterials, totalCost, description);
  }, [selectedMaterials]);

  const fetchMaterials = async () => {
    const response = await fetch('/api/materials/search');
    const data = await response.json();
    setMaterials(data);
  };

  const fetchMaterialDetails = async (materialId: number) => {
    const response = await fetch(`/api/materials/${materialId}`);
    const data = await response.json();
    setSelectedMaterialDetails(data);
    
    // Set preferred vendor if available
    const preferredVendor = data.vendors.find((v: Vendor) => v.isPreferred);
    if (preferredVendor) {
      setCurrentItem(prev => ({ ...prev, vendorId: preferredVendor.id }));
    }
    
    // Fetch last purchase rate if specification selected
    if (currentItem.specificationId) {
      // This would be from rate history API
      // For now, showing in UI when available
    }
  };

  const handleMaterialChange = (materialId: number) => {
    setCurrentItem({ ...currentItem, materialId, specificationId: 0, vendorId: 0 });
    if (materialId) {
      fetchMaterialDetails(materialId);
    } else {
      setSelectedMaterialDetails(null);
    }
  };

  const handleAddMaterial = () => {
    if (!currentItem.materialId || !currentItem.quantity || !currentItem.unitPrice || !currentItem.vendorId) {
      alert('Please fill all required fields');
      return;
    }

    const material = materials.find(m => m.id === currentItem.materialId);
    const spec = selectedMaterialDetails?.specifications.find(s => s.id === currentItem.specificationId);
    const vendor = selectedMaterialDetails?.vendors.find(v => v.id === currentItem.vendorId);

    if (!material || !vendor) return;

    const newItem: MaterialItem = {
      materialId: currentItem.materialId,
      materialName: material.name,
      specificationId: currentItem.specificationId,
      specification: spec?.specification || '',
      quantity: currentItem.quantity,
      unit: material.defaultUnit,
      unitPrice: currentItem.unitPrice,
      vendorId: currentItem.vendorId,
      vendorName: vendor.name,
      lastPurchaseRate: selectedMaterialDetails?.lastPurchaseRate,
      total: currentItem.quantity * currentItem.unitPrice
    };

    setSelectedMaterials([...selectedMaterials, newItem]);
    
    // Reset form
    setCurrentItem({
      materialId: 0,
      specificationId: 0,
      quantity: 0,
      vendorId: 0,
      unitPrice: 0
    });
    setSelectedMaterialDetails(null);
  };

  const handleRemoveMaterial = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Material Selection Form */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-lg">Add Material</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Material Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Material *</label>
            <select
              value={currentItem.materialId}
              onChange={(e) => handleMaterialChange(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              <option value={0}>Select Material</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Specification Dropdown */}
          {selectedMaterialDetails && selectedMaterialDetails.specifications.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Specification</label>
              <select
                value={currentItem.specificationId}
                onChange={(e) => setCurrentItem({ ...currentItem, specificationId: Number(e.target.value) })}
                className="w-full border rounded px-3 py-2"
              >
                <option value={0}>Select Specification</option>
                {selectedMaterialDetails.specifications.map(s => (
                  <option key={s.id} value={s.id}>{s.specification}</option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Quantity * {selectedMaterialDetails && `(${selectedMaterialDetails.defaultUnit})`}
            </label>
            <input
              type="number"
              step="0.01"
              value={currentItem.quantity || ''}
              onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              placeholder="0"
            />
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Rate (₹) *
              {selectedMaterialDetails?.lastPurchaseRate && (
                <span className="text-xs text-gray-500 ml-2">
                  Last: ₹{selectedMaterialDetails.lastPurchaseRate}
                </span>
              )}
            </label>
            <input
              type="number"
              step="0.01"
              value={currentItem.unitPrice || ''}
              onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              placeholder="0.00"
            />
          </div>

          {/* Vendor */}
          {selectedMaterialDetails && (
            <div>
              <label className="block text-sm font-medium mb-1">Vendor *</label>
              <select
                value={currentItem.vendorId}
                onChange={(e) => setCurrentItem({ ...currentItem, vendorId: Number(e.target.value) })}
                className="w-full border rounded px-3 py-2"
              >
                <option value={0}>Select Vendor</option>
                {selectedMaterialDetails.vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.isPreferred && '⭐'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Item Total */}
        {currentItem.quantity > 0 && currentItem.unitPrice > 0 && (
          <div className="bg-gray-50 p-3 rounded">
            <span className="font-medium">Item Total: ₹{(currentItem.quantity * currentItem.unitPrice).toFixed(2)}</span>
          </div>
        )}

        <button
          onClick={handleAddMaterial}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Material
        </button>
      </div>

      {/* Selected Materials Table */}
      {selectedMaterials.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Material</th>
                <th className="px-4 py-2 text-left">Specification</th>
                <th className="px-4 py-2 text-right">Qty</th>
                <th className="px-4 py-2 text-right">Rate</th>
                <th className="px-4 py-2 text-left">Vendor</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {selectedMaterials.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{item.materialName}</td>
                  <td className="px-4 py-2">{item.specification || '-'}</td>
                  <td className="px-4 py-2 text-right">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-2 text-right">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-2">{item.vendorName}</td>
                  <td className="px-4 py-2 text-right font-medium">₹{item.total.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleRemoveMaterial(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2">
              <tr>
                <td colSpan={5} className="px-4 py-2 text-right font-semibold">TOTAL COST:</td>
                <td className="px-4 py-2 text-right font-bold text-lg">
                  ₹{selectedMaterials.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
```

### **2. Quotation Creation Page**

```typescript
// pages/CreateQuotation.tsx
import React, { useState } from 'react';
import { MaterialPicker } from '../components/MaterialPicker';
import { useParams, useNavigate } from 'react-router-dom';

interface MaterialItem {
  materialId: number;
  specificationId: number;
  quantity: number;
  vendorId: number;
  unitPrice: number;
}

export const CreateQuotationPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  
  const [materials, setMaterials] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [description, setDescription] = useState('');
  const [estimatedDays, setEstimatedDays] = useState(5);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMaterialsChange = (mats: any[], total: number, desc: string) => {
    setMaterials(mats);
    setTotalCost(total);
    setDescription(desc);
  };

  const handleSubmit = async () => {
    if (materials.length === 0) {
      alert('Please add at least one material');
      return;
    }

    setLoading(true);

    const payload = {
      requestId: Number(requestId),
      materials: materials.map(m => ({
        materialId: m.materialId,
        specificationId: m.specificationId || null,
        quantity: m.quantity,
        vendorId: m.vendorId,
        unitPrice: m.unitPrice
      })),
      estimatedDays,
      remarks
    };

    try {
      const response = await fetch('/api/quotations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Quotation created and sent for SA approval');
        navigate('/admin/requests');
      } else {
        alert('Failed to create quotation');
      }
    } catch (error) {
      alert('Error creating quotation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Quotation - Request #{requestId}</h1>

      <MaterialPicker 
        requestId={Number(requestId)} 
        onMaterialsChange={handleMaterialsChange}
      />

      <div className="mt-6 border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-lg">Quotation Details</h3>

        <div>
          <label className="block text-sm font-medium mb-1">Estimated Completion Time (days) *</label>
          <input
            type="number"
            value={estimatedDays}
            onChange={(e) => setEstimatedDays(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            min={1}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Admin Notes (internal, not visible to requester)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Optional internal notes..."
          />
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Auto-Generated Description:</h4>
          <p className="text-sm">{description || 'Add materials to see description'}</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/admin/requests')}
            className="px-6 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || materials.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Send to SA for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔄 WORKFLOW WITH EXISTING STATUSES

### **Status Flow:**
```
SUBMITTED (User submits request)
   ↓
[Admin creates quotation with material picker]
   ↓
PENDING_SA_APPROVAL (Quotation awaits SA approval)
   ↓
[SA reviews and approves quotation]
   ↓
QUOTATION_SENT (New status - quotation sent to user)
   ↓
[User approves quotation]
   ↓
APPROVED (Existing status)
   ↓
[System runs inventory check & vendor list generation]
   ↓
VENDOR_LIST_PREPARED (New status)
   ↓
... rest of workflow
```

### **Key Integration Points:**

1. **When Request is SUBMITTED:**
   - Admin clicks "Create Quotation"
   - Opens MaterialPicker component
   - Selects materials, specs, vendors
   - System auto-calculates total
   - System auto-generates description
   - Status → PENDING_SA_APPROVAL

2. **When SA Approves (PENDING_SA_APPROVAL → QUOTATION_SENT):**
   - Backend sends quotation email to requester
   - Status → QUOTATION_SENT

3. **When User Approves (QUOTATION_SENT → APPROVED):**
   - Backend calls `quotationService.processApprovedQuotation()`
   - System checks inventory
   - Deducts from stock where available
   - Marks items as PENDING_PURCHASE where needed
   - Status → APPROVED

4. **Vendor List Generation (APPROVED → VENDOR_LIST_PREPARED):**
   - Query aggregates all PENDING_PURCHASE items by vendor
   - Creates vendor_purchase_lists entries
   - Status → VENDOR_LIST_PREPARED

---

## 🎯 KEY API ENDPOINTS

```
GET  /api/materials/search?query=ply
GET  /api/materials/{id}
POST /api/quotations/create
GET  /api/quotations/{requestId}/inventory-check
POST /api/quotations/{requestId}/approve (SA only)
GET  /api/vendor-lists (Get aggregated purchase lists)
```

---

## ✅ TESTING CHECKLIST

1. ✅ Create materials seed data
2. ✅ Create vendors seed data
3. ✅ Map materials to vendors
4. ✅ Add sample inventory
5. ✅ Test material search API
6. ✅ Test material picker component
7. ✅ Test quotation creation
8. ✅ Test SA approval flow
9. ✅ Test inventory deduction
10. ✅ Test vendor list generation

---

## 🚀 DEPLOYMENT NOTES

1. Run all SQL migrations in order
2. Seed initial data (materials, vendors, mappings)
3. Deploy backend changes
4. Deploy frontend components
5. Test end-to-end flow with sample request

---

**This implementation guide is ready for your AI coding assistant to implement the complete material-based quotation system!**