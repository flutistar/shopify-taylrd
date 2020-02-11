// Override Settings
var bcSfFilterSettings = {
    general: {
        limit: bcSfFilterConfig.custom.products_per_page,
        /* Optional */
        loadProductFirst: false,
        filterTreeMobileStyle: 'style2',
    },
};

// Declare Templates
var bcSfFilterTemplate = {
    // Grid Template
    'productGridItemHtml': '<div id="{{itemHandle}}" class="grid__item grid-product ' + bcSfFilterConfig.custom.grid_item_width + ' {{itemQuickShopClass}}" data-aos="row-of-' + bcSfFilterConfig.custom.products_per_row + '">' +
                                '<div class="grid-product__content">' +
  									'{{itemCustomLabel}}' +
                                    '{{itemSaleLabel}}' +
                                    '{{itemSoldOutLabel}}' +
                                    '<a href="{{itemUrl}}" class="grid-product__link {{itemSoldOutClass}}">' +
                                        '<div class="grid-product__image-mask">'+
                                            '{{itemQuickShopButton}}' +
                                            '{{itemImages}}'+
                                        '</div>' +
                                        '<div class="grid-product__meta">' +
                                            '{{itemTitleHtml}}' +
                                            '{{itemVendor}}' +
                                            '<div class="grid-product__price">{{itemPrice}}</div>' +
                                            '{{reviewHtml}}'+
                                        '</div>' +
                                    '</a>' +
                                '</div>' +
                                '{{colorSwatch}}'+
                                '<div id="QuickShopModal-{{itemId}}" class="modal modal--square" data-product-id="{{itemId}}"></div>' +
                            '</div>',

    // Pagination Template
    'previousActiveHtml': '<span class="prev"><a href="{{itemUrl}}" title=""><svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-chevron-left" viewBox="0 0 284.49 498.98"><defs><style>.cls-1{fill:#231f20}</style></defs><path class="cls-1" d="M249.49 0a35 35 0 0 1 24.75 59.75L84.49 249.49l189.75 189.74a35.002 35.002 0 1 1-49.5 49.5L10.25 274.24a35 35 0 0 1 0-49.5L224.74 10.25A34.89 34.89 0 0 1 249.49 0z"></path></svg><span class="icon__fallback-text">Previous</span></a></span>',
    'previousDisabledHtml': '',
    'nextActiveHtml': '<span class="next"><a href="{{itemUrl}}" title=""><svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-chevron-right" viewBox="0 0 284.49 498.98"><defs><style>.cls-1{fill:#231f20}</style></defs><path class="cls-1" d="M35 498.98a35 35 0 0 1-24.75-59.75l189.74-189.74L10.25 59.75a35.002 35.002 0 0 1 49.5-49.5l214.49 214.49a35 35 0 0 1 0 49.5L59.75 488.73A34.89 34.89 0 0 1 35 498.98z"></path></svg><span class="icon__fallback-text">Next</span></a></span>',
    'nextDisabledHtml': '',
    'pageItemHtml': '<span class="page"><a href="{{itemUrl}}" title="">{{itemTitle}}</a></span>',
    'pageItemSelectedHtml': '<span class="page current">{{itemTitle}}</span>',
    'pageItemRemainHtml': '<span class="deco">...</span>',
    'paginateHtml': '{{previous}}{{pageItems}}{{next}}',

    // Sorting Template
    'sortingHtml': '<label class="hidden-label">' + bcSfFilterConfig.label.sorting + '</label><select>{{sortingItems}}</select>',
};

/************************** BUILD PRODUCT LIST **************************/

// Build Product Grid Item
BCSfFilter.prototype.buildProductGridItem = function(data, index, totalProduct) {
    /*** Prepare data ***/
    var images = data.images_info;
     // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (getParam('variant') !== null && getParam('variant') != '') {
        var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
        if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
        for (var i = 0; i < data['variants'].length; i++) {
            if (data['variants'][i].available) {
                firstVariant = data['variants'][i];
                break;
            }
        }
    }
    /*** End Prepare data ***/

    // Get Template
    var itemHtml = bcSfFilterTemplate.productGridItemHtml;

    // Get Image size
    var imgSize = '450x650';
    switch (bcSfFilterConfig.custom.products_per_row) {
        case 5: imgSize = '350x550'; break;
        case 4: imgSize = '450x650'; break;
        case 3: imgSize = '450x650'; break;
        case 2: imgSize = '850x1050'; break;
        case 1: imgSize = '1400x1800'; break;
    }

    // Add Thumbnail
    var aspectRatio = images.length > 0 ? images[0]['width'] / images[0]['height'] : '';
    var paddingBottom = images.length > 0 ? 100 / aspectRatio : '';
    var itemThumbUrl = images.length > 0 ? this.optimizeImage(images[0]['src'], imgSize) : bcSfFilterConfig.general.no_image_url;
    var thumb = images.length > 0 ? images[0] : bcSfFilterConfig.general.no_image_url;
    var bgset = buildBgSet(thumb);
    var itemImagesHtml = '';
    if(bcSfFilterConfig.custom.product_grid_image_size == 'natural'){
        itemImagesHtml += '<div class="image-wrap" style="height: 0; padding-bottom: ' + paddingBottom + '%;">' +
                            '<img ' +
                                'class="grid-view-item__image lazyload" ' +
                                'data-src="' + this.getFeaturedImage(images, '{width}x') + '" ' +
                                'data-widths="[180, 360, 540, 720, 900, 1080, 1296, 1512, 1728, 2048]" ' +
                                'data-aspectratio="' + aspectRatio + '" ' +
                                'data-sizes="auto" ' +
                                'alt="{{itemTitle}}">' +
                        '</div>';
        if (!soldOut) {
            if (bcSfFilterConfig.custom.product_hover_image && images.length > 1) {
                bgset = buildBgSet(images[1]);
                itemImagesHtml += '<div ' +
                                    'class="grid-product__secondary-image small--hide lazyload"' +
                                    'data-bgset="' + bgset + '"' +
                                    'data-sizes="auto">' +
                                  '</div>';
            }
        }
    } else {
        itemImagesHtml += '<div ' +
                              'class="grid__image-ratio grid__image-ratio--' + bcSfFilterConfig.custom.product_grid_image_size + ' lazyload"' +
                              'data-bgset="' + bgset +'"' +
                              'data-sizes="auto">' +
                          '</div>';
    }

    itemHtml = itemHtml.replace(/{{itemImages}}/g, itemImagesHtml);

    // Add Price
    var itemPriceHtml = '';
    if (onSale) {
        itemPriceHtml += '<span class="visually-hidden">' + bcSfFilterConfig.label.regular_price + '</span>';
        itemPriceHtml += '<span class="grid-product__price--original">' + this.formatMoney(data.compare_at_price_min) + '</span>';
        itemPriceHtml += '<span class="visually-hidden">' + bcSfFilterConfig.label.sale_price + '</span>';
    }
    if (priceVaries) {
        itemPriceHtml += bcSfFilterConfig.label.from_text_html.replace(/{{ price }}/g, this.formatMoney(data.price_min));
    } else {
        itemPriceHtml += this.formatMoney(data.price_min);
    }
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);
  
  	// Add custom Label
  	var hasCustomLabel = false;
  	var itemCustomLabelHtml = '';
  	if (data.tags && data.tags.length > 0){
      	for (var i = 0; i < data.tags.length; i++){
      		var tag = data.tags[i];
          	if (tag.startsWith('_label_')){
          		hasCustomLabel = true; 
              	var customLabel = tag.replace('_label_', '');              	    
              	itemCustomLabelHtml = '<div class="grid-product__tag">' + customLabel + '</div>';
              	break;
            }
        }
    }
  	itemHtml = itemHtml.replace(/{{itemCustomLabel}}/g, itemCustomLabelHtml);

    // Add soldOut class
    var itemSoldOutClass = (soldOut && !hasCustomLabel) ? 'grid-product__link--disabled' : '';
    itemHtml = itemHtml.replace(/{{itemSoldOutClass}}/g, itemSoldOutClass);

    // Add soldOut Label
    var itemSoldOutLabelHtml = (soldOut && !hasCustomLabel) ? '<div class="grid-product__tag">' + bcSfFilterConfig.label.sold_out + '</div>' : '';
    itemHtml = itemHtml.replace(/{{itemSoldOutLabel}}/g, itemSoldOutLabelHtml);

    // Add onSale Label
    var itemSaleLabelHtml = '';
    if (bcSfFilterConfig.custom.product_save_amount && onSale && !soldOut && !hasCustomLabel) {
        var savePrice = this.formatMoney(data.compare_at_price_min - data.price_min);
        itemSaleLabelHtml = '<div class="grid-product__tag">Sale</div>';
    }
    itemHtml = itemHtml.replace(/{{itemSaleLabel}}/g, itemSaleLabelHtml);

    // Add Vendor
    var itemVendorHtml = bcSfFilterConfig.custom.vendor_enable ? '<div class="grid-product__vendor">' + data.vendor + '</div>' : '';
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

    // Add Quick shop
    var itemQuickShopClass = '';
    var itemQuickShopButtonHtml = '';
    if (bcSfFilterConfig.custom.quick_shop_enable && !soldOut) {
        itemQuickShopClass = 'grid-product__has-quick-shop';
        itemQuickShopButtonHtml = '<div class="quick-product__btn js-modal-open-quick-modal-{{itemId}} small--hide" data-product-id="{{itemId}}">' +
                                        '<span class="quick-product__label">' + bcSfFilterConfig.label.quick_shop + '</span>' +
                                    '</div>';
    }
    itemHtml = itemHtml.replace(/{{itemQuickShopClass}}/g, itemQuickShopClass);
    itemHtml = itemHtml.replace(/{{itemQuickShopButton}}/g, itemQuickShopButtonHtml);

    // Build content for Modal
    if (!this.isMobile() && bcSfFilterConfig.custom.quick_shop_enable) {
        var quickUrl = this.buildProductItemUrl(data) + '?view=bc-sf-quickview';
        jQ.ajax({url: quickUrl, success: function(result) {
            jQ('#QuickShopModal-' + data.id).html(result);

            if (index == totalProduct) {
                theme.initQuickShop();
                AOS.init({
                  easing: 'ease-out-quad',
                  once: true
                });

                window.sections = new theme.Sections();
                sections.register('product', theme.Product);
                sections.register('product-template', theme.Product);
                sections.register('collection-template', theme.Collection);
            }
        }});
    }
    //Review
    var reviewHtml = '<span class="stamped-product-reviews-badge" data-id="{{itemId}}"></span>';    
    itemHtml = itemHtml.replace(/{{reviewHtml}}/g, reviewHtml);   
  

    // ColorSwatch
    var colorSwatch = buildSwatch(data, this);
    itemHtml = itemHtml.replace(/{{colorSwatch}}/g, colorSwatch);

    // Add main attribute (Always put at the end of this function)
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
  	var itemTitleHtml = '';
    if (data.title.indexOf('|') !== -1 ) {
        var temp = data.title.split('|');
        itemTitleHtml += '<div class="grid-product__title grid-product__title--' + bcSfFilterConfig.custom.type_product_style + '">' + temp[1] + '</div>';
        itemTitleHtml += '<p class="whiskey">' + temp[0] + '</p>';
    } else {
        itemTitleHtml += '<div class="grid-product__title grid-product__title--' + bcSfFilterConfig.custom.type_product_style + '">' + data.title + '</div>';
    }
  	itemHtml = itemHtml.replace(/{{itemTitleHtml}}/g, itemTitleHtml);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));

    return itemHtml;
};
// Build Swatch
function buildSwatch(data, ob) {
  var _this = ob;
  var itemSwatchHtml = '';
  if (bcSfFilterConfig.custom.collection_color_swatches) {
    var swatch_file_extension = 'png';
    var color_count = 0 ;
    data.options_with_values.forEach(function(option, index) {
      var option_name = option.name.toLowerCase();
      if (option_name.indexOf('color')!=-1 || option_name.indexOf('colour')!=-1) {
        var option_index = index;
        var values = '';
        itemSwatchHtml += ' <div class="grid-product__colors grid-product__colors--' + data.id +'" >';
        data.variants.forEach(function(variant) {
          var temp = variant.merged_options[option_index].split(':');
          var value = temp[1];
          if ( values.indexOf(value) == -1 ) {
            color_count ++;
            values = values + ',' + value;
            values = values.split(',');
            var color_image = _this.optimizeImage(variant.image, '50px');
            var color_swatch_fallback = value;
            var classImageSwatch = variant.image?'color-swatch--with-image':'';
            var attImage = '';
            if(variant.image){
                var variant_image = _this.optimizeImage(variant.image, '400px');
                attImage += 'data-variant-id="' + variant.id + '"';
                attImage += 'data-variant-image="'+ variant_image +'"';
            }
            itemSwatchHtml += '<a  href="' + _this.buildProductItemUrl(data) + '?variant='+ variant.id +'"'+ attImage +' class="color-swatch '+ classImageSwatch +'" >';
            itemSwatchHtml += '<span class="color-swatch--icon" style="background-image: url('+ color_image +'); background-color: '+ color_swatch_fallback +';"></span> ';
            itemSwatchHtml +='</a>';
          }
        });
        itemSwatchHtml += '</div>';
      }
    });
    if( color_count < 2){
      itemSwatchHtml += '<style>.grid-product__colors--'+ data.id +' {display: none;}</style>';
    }
  }
  return itemSwatchHtml;
}
/************************** END BUILD PRODUCT LIST **************************/

// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
    if (this.getSettingValue('general.paginationType') == 'default') {
        // Get page info
        var currentPage = parseInt(this.queryParams.page);
        var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

        // If it has only one page, clear Pagination
        if (totalPage == 1) {
            jQ(this.selector.pagination).html('');
            return false;
        }

        if (this.getSettingValue('general.paginationType') == 'default') {
            var paginationHtml = bcSfFilterTemplate.paginateHtml;

            // Build Previous
            var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousActiveHtml : bcSfFilterTemplate.previousDisabledHtml;
            previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
            paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

            // Build Next
            var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextActiveHtml :  bcSfFilterTemplate.nextDisabledHtml;
            nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
            paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

            // Create page items array
            var beforeCurrentPageArr = [];
            for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
                beforeCurrentPageArr.unshift(iBefore);
            }
            if (currentPage - 4 > 0) {
                beforeCurrentPageArr.unshift('...');
            }
            if (currentPage - 4 >= 0) {
                beforeCurrentPageArr.unshift(1);
            }
            beforeCurrentPageArr.push(currentPage);

            var afterCurrentPageArr = [];
            for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
                afterCurrentPageArr.push(iAfter);
            }
            if (currentPage + 3 < totalPage) {
                afterCurrentPageArr.push('...');
            }
            if (currentPage + 3 <= totalPage) {
                afterCurrentPageArr.push(totalPage);
            }

            // Build page items
            var pageItemsHtml = '';
            var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
            for (var iPage = 0; iPage < pageArr.length; iPage++) {
                if (pageArr[iPage] == '...') {
                    pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
                } else {
                    pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
                }
                pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
                pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
            }
            paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

            jQ(this.selector.pagination).html(paginationHtml);
        }
    }
};

/************************** BUILD TOOLBAR **************************/

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
    if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
        jQ(this.selector.topSorting).html('');
        var sortingArr = this.getSortingList();
        if (sortingArr) {
            // Build content
            var sortingItemsHtml = '';
            for (var k in sortingArr) {
                sortingItemsHtml += '<option value="' + k +'">' + sortingArr[k] + '</option>';
            }
            var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
            jQ(this.selector.topSorting).html(html);

            // Set current value
            jQ(this.selector.topSorting + ' select').val(this.queryParams.sort);
        }
    }
};

/************************** END BUILD TOOLBAR **************************/

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function(data, eventType) {
    AOS.init({
        easing: 'ease-out-quad',
        once: true,
        offset: 60,
        disableMutationObserver: true
    });
    window.innerShiv=function(){function t(t,e,i){return/^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i.test(i)?t:e+"></"+i+">"}var e,i,n=document,a="abbr article aside audio canvas datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video".split(" ");return function(r,o){if(!e&&(e=n.createElement("div"),e.innerHTML="<nav></nav>",i=1!==e.childNodes.length)){for(var s=n.createDocumentFragment(),d=a.length;d--;)s.createElement(a[d]);s.appendChild(e)}if(r=r.replace(/^\s\s*/,"").replace(/\s\s*$/,"").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"").replace(/(<([\w:]+)[^>]*?)\/>/g,t),e.innerHTML=(s=r.match(/^<(tbody|tr|td|col|colgroup|thead|tfoot)/i))?"<table>"+r+"</table>":r,s=s?e.getElementsByTagName(s[1])[0].parentNode:e,o===!1)return s.childNodes;for(var d=n.createDocumentFragment(),l=s.childNodes.length;l--;)d.appendChild(s.firstChild);return d}}(),function(){window.SPR=function(){function t(){}return t.shop=Shopify.shop,t.host="//productreviews.shopifycdn.com",t.version="v4",t.api_url=t.host+"/proxy/"+t.version,t.asset_url=t.host+"/assets/"+t.version,t.badgeEls=[],t.reviewEls=[],t.elSettings={},t.$=void 0,t.extraAjaxParams={shop:t.shop},t.registerCallbacks=function(){return this.$(document).bind("spr:badge:loaded","undefined"!=typeof SPRCallbacks&&null!==SPRCallbacks?SPRCallbacks.onBadgeLoad:void 0),this.$(document).bind("spr:product:loaded","undefined"!=typeof SPRCallbacks&&null!==SPRCallbacks?SPRCallbacks.onProductLoad:void 0),this.$(document).bind("spr:reviews:loaded","undefined"!=typeof SPRCallbacks&&null!==SPRCallbacks?SPRCallbacks.onReviewsLoad:void 0),this.$(document).bind("spr:form:loaded","undefined"!=typeof SPRCallbacks&&null!==SPRCallbacks?SPRCallbacks.onFormLoad:void 0),this.$(document).bind("spr:form:success","undefined"!=typeof SPRCallbacks&&null!==SPRCallbacks?SPRCallbacks.onFormSuccess:void 0),this.$(document).bind("spr:form:failure","undefined"!=typeof SPRCallbacks&&null!==SPRCallbacks?SPRCallbacks.onFormFailure:void 0)},t.loadStylesheet=function(){var t,e;return e=document.createElement("link"),e.setAttribute("rel","stylesheet"),e.setAttribute("type","text/css"),e.setAttribute("href",this.asset_url+"/spr.css"),e.setAttribute("media","screen"),t=document.getElementsByTagName("head")[0],t.appendChild(e)},t.initRatingHandler=function(){return t.$(document).on("mouseover mouseout","form a.spr-icon-star",function(e){var i,n,a;return i=e.currentTarget,a=t.$(i).attr("data-value"),n=t.$(i).parent(),"mouseover"===e.type?(n.find("a.spr-icon:lt("+a+")").addClass("spr-icon-star-hover"),n.find("a.spr-icon:gt("+(a-1)+")").removeClass("spr-icon-star-hover")):n.find("a.spr-icon").removeClass("spr-icon-star-hover")})},t.initDomEls=function(){return this.badgeEls=this.$(".shopify-product-reviews-badge[data-id]"),this.reviewEls=this.$("#shopify-product-reviews[data-id]"),this.$.each(this.reviewEls,function(t){return function(e,i){var n;return n=t.$(i).attr("data-id"),t.elSettings[n]={},t.elSettings[n].reviews_el="#"+(t.$(i).attr("data-reviews-prefix")?t.$(i).attr("data-reviews-prefix"):"reviews_"),t.elSettings[n].form_el="#"+(t.$(i).attr("data-form-prefix")?t.$(i).attr("data-form-prefix"):"form_")}}(this))},t.loadProducts=function(){return this.$.each(this.reviewEls,function(t){return function(e,i){var n,a,r;return a=t.$(i).attr("data-id"),n=t.$(i).attr("data-autoload"),"false"!==n?(r=t.$.extend({product_id:a,version:t.version},t.extraAjaxParams),t.$.get(t.api_url+"/reviews/product",r,t.productCallback,"jsonp")):void 0}}(this))},t.loadBadges=function(){var t,e,i,n,a;if(i=this.$.map(this.badgeEls,function(t){return function(e){return t.$(e).attr("data-id")}}(this)),i.length>0){for(e=7,a=[];(t=i.splice(0,e)).length>0;)n=this.$.extend(this.extraAjaxParams,{product_ids:t}),a.push(this.$.get(this.api_url+"/reviews/badges",n,this.badgesCallback,"jsonp"));return a}},t.pageReviews=function(t){var e,i,n;return n=this.$(t).data("product-id"),i=this.$(t).data("page"),e=this.$.extend({page:i,product_id:n},this.extraAjaxParams),this.$.get(this.api_url+"/reviews",e,this.paginateCallback,"jsonp"),!1},t.submitForm=function(t){var e;return e=this.$(t).serializeObject(),e=this.$.extend(e,this.extraAjaxParams),e=this.$.param(e),e=e.replace(/%0D%0A/g,"%0A"),this.$.ajax({url:this.api_url+"/reviews/create",type:"GET",dataType:"jsonp",data:e,success:this.formCallback,beforeSend:function(t){return function(){return t.$(".spr-button-primary").attr("disabled","disabled")}}(this),complete:function(t){return function(){return t.$(".spr-button-primary").removeAttr("disabled")}}(this)}),!1},t.reportReview=function(t){var e;return confirm("Are you sure you want to report this review as inappropriate?")&&(e=this.$.extend({id:t},this.extraAjaxParams),this.$.get(this.api_url+"/reviews/report",e,this.reportCallback,"jsonp")),!1},t.toggleReviews=function(t){var e;return e=this.$("#shopify-product-reviews[data-id='"+t+"']"),e.find(".spr-reviews").toggle()},t.toggleForm=function(t){var e;return e=this.$("#shopify-product-reviews[data-id='"+t+"']"),e.find(".spr-form").toggle()},t.setRating=function(t){var e,i,n;return e=this.$(t).parents("form"),n=this.$(t).attr("data-value"),i=this.$(t).parent(),e.find("input[name='review[rating]']").val(n),this.setStarRating(n,i)},t.setStarRating=function(t,e){return e.find("a:lt("+t+")").removeClass("spr-icon-star-empty spr-icon-star-hover"),e.find("a:gt("+(t-1)+")").removeClass("spr-icon-star-hover").addClass("spr-icon-star-empty")},t.badgesCallback=function(e){var i;return i=e.badges,t.$.map(t.badgeEls,function(e){var n;return n=t.$(e).attr("data-id"),void 0!==i[n]?(t.$(e).replaceWith(i[n]),t.$(document).trigger("spr:badge:loaded",{id:n})):void 0})},t.productCallback=function(e){var i;return i=e.remote_id.toString(),t.renderProduct(i,e.product),t.renderForm(i,e.form),t.renderReviews(i,e.reviews)},t.renderProduct=function(t,e){return this.$.map(this.reviewEls,function(i){return function(n){return t===i.$(n).attr("data-id")?(i.$(n).html(innerShiv(e,!1)),i.$(document).trigger("spr:product:loaded",{id:t})):void 0}}(this))},t.renderForm=function(t,e){var i;return i=this.$(this.elSettings[t].form_el+t),i.html(e),this.$(document).trigger("spr:form:loaded",{id:t})},t.renderReviews=function(e,i){var n;return n=t.$(t.elSettings[e].reviews_el+e),n.html(i),t.$(document).trigger("spr:reviews:loaded",{id:e})},t.formCallback=function(e){var i,n,a,r;return r=e.status,a=e.remote_id,n=e.form,i=t.$(t.elSettings[a].form_el+a),i.html(n),"failure"===r&&t.initStarRating(i),"success"===r&&t.$("#shopify-product-reviews[data-id='"+a+"'] .spr-summary-actions-newreview").hide(),t.$(document).trigger("spr:form:"+r,{id:a})},t.initStarRating=function(t){var e,i,n;return n=t.find("input[name='review[rating]']"),n&&n.val()?(i=n.val(),e=t.find(".spr-starrating"),this.setStarRating(i,e)):void 0},t.paginateCallback=function(e){var i,n;return n=e.remote_id.toString(),i=e.reviews,t.renderReviews(n,i)},t.reportCallback=function(e){var i;return i="#report_"+e.id,t.$(i).replaceWith("<span class='spr-review-reportreview'>"+t.$(i).attr("data-msg")+"</span>")},t.loadjQuery=function(e){return t.loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js",function(){return t.$=jQuery.noConflict(!0),e()})},t.loadScript=function(t,e){var i;return i=document.createElement("script"),i.type="text/javascript",i.readyState?i.onreadystatechange=function(){return"loaded"===i.readyState||"complete"===i.readyState?(i.onreadystatechange=null,e()):void 0}:i.onload=function(){return e()},i.src=t,document.getElementsByTagName("head")[0].appendChild(i)},t.loadjQueryExtentions=function(t){return t.fn.serializeObject=function(){var e,i;return e={},i=this.serializeArray(),t.each(i,function(){return e[this.name]?(e[this.name].push||(e[this.name]=[e[this.name]]),e[this.name].push(this.value||"")):e[this.name]=this.value||""}),e}},t}(),function(){return SPR.loadStylesheet(),SPR.loadjQuery(function(){return SPR.$.ajaxSetup({cache:!1}),SPR.loadjQueryExtentions(SPR.$),SPR.$(document).ready(function(){return SPR.registerCallbacks(),SPR.initRatingHandler(),SPR.initDomEls(),SPR.loadProducts(),SPR.loadBadges()})})}()}.call(this);
  
  // Integrate Stamped.io Reviews
  var self = this;
  if (typeof StampedFn !== 'undefined' && typeof StampedFn.loadBadges == 'function') {
          StampedFn.loadBadges();
  }
};

// Build additional elements
BCSfFilter.prototype.buildAdditionalElements = function(data, eventType) {
    var totalProduct = '';
    if (data.total_product == 1) {
        totalProduct = bcSfFilterConfig.label.items_with_count_one.replace(/{{ count }}/g, data.total_product);
    } else {
        totalProduct = bcSfFilterConfig.label.items_with_count_other.replace(/{{ count }}/g, data.total_product);
    }
    jQ('#bc-sf-filter-total-product').html(totalProduct); 

};

function buildBgSet(image) {
    var html = '';
    if (typeof image !== 'undefined' && image.hasOwnProperty('src')) {
        var aspectRatio = image.width / image.height;
        if (image.width <= 180) html += bcsffilter.optimizeImage(image['src'], '180x') + ' 180w ' + Math.round(180 / aspectRatio) + 'h,';
        if (image.width > 180) html += bcsffilter.optimizeImage(image['src'], '180x') + ' 180w ' + Math.round(180 / aspectRatio) + 'h,';
        if (image.width > 360) html += bcsffilter.optimizeImage(image['src'], '360x') + ' 360w ' + Math.round(360 / aspectRatio) + 'h,';
        if (image.width > 540) html += bcsffilter.optimizeImage(image['src'], '540x') + ' 540w ' + Math.round(540 / aspectRatio) + 'h,';
        if (image.width > 720) html += bcsffilter.optimizeImage(image['src'], '720x') + ' 720w ' + Math.round(720 / aspectRatio) + 'h,';
        if (image.width > 900) html += bcsffilter.optimizeImage(image['src'], '900x') + ' 900w ' + Math.round(900 / aspectRatio) + 'h,';
        if (image.width > 1080) html += bcsffilter.optimizeImage(image['src'], '1080x') + ' 1080w ' + Math.round(1080 / aspectRatio) + 'h,';
        if (image.width > 1296) html += bcsffilter.optimizeImage(image['src'], '1296x') + ' 1296w ' + Math.round(1296 / aspectRatio) + 'h,';
        if (image.width > 1512) html += bcsffilter.optimizeImage(image['src'], '1512x') + ' 1512w ' + Math.round(1512 / aspectRatio) + 'h,';
        if (image.width > 1728) html += bcsffilter.optimizeImage(image['src'], '1728x') + ' 1728w ' + Math.round(1728 / aspectRatio) + 'h,';
    }
    return html;
}

// Build Default layout
function buildDefaultLink(a,b){var c=window.location.href.split("?")[0];return c+="?"+a+"="+b}BCSfFilter.prototype.buildDefaultElements=function(a){if(bcSfFilterConfig.general.hasOwnProperty("collection_count")&&jQ("#bc-sf-filter-bottom-pagination").length>0){var b=bcSfFilterConfig.general.collection_count,c=parseInt(this.queryParams.page),d=Math.ceil(b/this.queryParams.limit);if(1==d)return jQ(this.selector.pagination).html(""),!1;if("default"==this.getSettingValue("general.paginationType")){var e=bcSfFilterTemplate.paginateHtml,f="";f=c>1?bcSfFilterTemplate.hasOwnProperty("previousActiveHtml")?bcSfFilterTemplate.previousActiveHtml:bcSfFilterTemplate.previousHtml:bcSfFilterTemplate.hasOwnProperty("previousDisabledHtml")?bcSfFilterTemplate.previousDisabledHtml:"",f=f.replace(/{{itemUrl}}/g,buildDefaultLink("page",c-1)),e=e.replace(/{{previous}}/g,f);var g="";g=c<d?bcSfFilterTemplate.hasOwnProperty("nextActiveHtml")?bcSfFilterTemplate.nextActiveHtml:bcSfFilterTemplate.nextHtml:bcSfFilterTemplate.hasOwnProperty("nextDisabledHtml")?bcSfFilterTemplate.nextDisabledHtml:"",g=g.replace(/{{itemUrl}}/g,buildDefaultLink("page",c+1)),e=e.replace(/{{next}}/g,g);for(var h=[],i=c-1;i>c-3&&i>0;i--)h.unshift(i);c-4>0&&h.unshift("..."),c-4>=0&&h.unshift(1),h.push(c);for(var j=[],k=c+1;k<c+3&&k<=d;k++)j.push(k);c+3<d&&j.push("..."),c+3<=d&&j.push(d);for(var l="",m=h.concat(j),n=0;n<m.length;n++)"..."==m[n]?l+=bcSfFilterTemplate.pageItemRemainHtml:l+=m[n]==c?bcSfFilterTemplate.pageItemSelectedHtml:bcSfFilterTemplate.pageItemHtml,l=l.replace(/{{itemTitle}}/g,m[n]),l=l.replace(/{{itemUrl}}/g,buildDefaultLink("page",m[n]));e=e.replace(/{{pageItems}}/g,l),jQ(this.selector.pagination).html(e)}}if(bcSfFilterTemplate.hasOwnProperty("sortingHtml")&&jQ(this.selector.topSorting).length>0){jQ(this.selector.topSorting).html("");var o=this.getSortingList();if(o){var p="";for(var q in o)p+='<option value="'+q+'">'+o[q]+"</option>";var r=bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g,p);jQ(this.selector.topSorting).html(r);var s=void 0!==this.queryParams.sort_by?this.queryParams.sort_by:this.defaultSorting;jQ(this.selector.topSorting+" select").val(s),jQ(this.selector.topSorting+" select").change(function(a){window.location.href=buildDefaultLink("sort_by",jQ(this).val())})}}};

BCSfFilter.prototype.prepareProductData = function(data) { var countData = data.length; for (var k = 0; k < countData; k++) { data[k]['images'] = data[k]['images_info']; if (data[k]['images'].length > 0) { data[k]['featured_image'] = data[k]['images'][0] } else { data[k]['featured_image'] = { src: bcSfFilterConfig.general.no_image_url, width: '', height: '', aspect_ratio: 0 } } data[k]['url'] = '/products/' + data[k].handle; var optionsArr = []; var countOptionsWithValues = data[k]['options_with_values'].length; for (var i = 0; i < countOptionsWithValues; i++) { optionsArr.push(data[k]['options_with_values'][i]['name']) } data[k]['options'] = optionsArr; if (typeof bcSfFilterConfig.general.currencies != 'undefined' && bcSfFilterConfig.general.currencies.length > 1) { var currentCurrency = bcSfFilterConfig.general.current_currency.toLowerCase().trim(); function updateMultiCurrencyPrice(oldPrice, newPrice) { if (typeof newPrice != 'undefined') { return newPrice; } return oldPrice; } data[k].price_min = updateMultiCurrencyPrice(data[k].price_min, data[k]['price_min_' + currentCurrency]); data[k].price_max = updateMultiCurrencyPrice(data[k].price_max, data[k]['price_max_' + currentCurrency]); data[k].compare_at_price_min = updateMultiCurrencyPrice(data[k].compare_at_price_min, data[k]['compare_at_price_min_' + currentCurrency]); data[k].compare_at_price_max = updateMultiCurrencyPrice(data[k].compare_at_price_max, data[k]['compare_at_price_max_' + currentCurrency]); } data[k]['price_min'] *= 100, data[k]['price_max'] *= 100, data[k]['compare_at_price_min'] *= 100, data[k]['compare_at_price_max'] *= 100; data[k]['price'] = data[k]['price_min']; data[k]['compare_at_price'] = data[k]['compare_at_price_min']; data[k]['price_varies'] = data[k]['price_min'] != data[k]['price_max']; var firstVariant = data[k]['variants'][0]; if (getParam('variant') !== null && getParam('variant') != '') { var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant') }); if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0] } else { var countVariants = data[k]['variants'].length; for (var i = 0; i < countVariants; i++) { if (data[k]['variants'][i].available) { firstVariant = data[k]['variants'][i]; break } } } data[k]['selected_or_first_available_variant'] = firstVariant; var countVariants = data[k]['variants'].length; for (var i = 0; i < countVariants; i++) { var variantOptionArr = []; var count = 1; var variant = data[k]['variants'][i]; var variantOptions = variant['merged_options']; if (Array.isArray(variantOptions)) { var countVariantOptions = variantOptions.length; for (var j = 0; j < countVariantOptions; j++) { var temp = variantOptions[j].split(':'); data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1]; data[k]['variants'][i]['option_' + temp[0]] = temp[1]; variantOptionArr.push(temp[1]) } data[k]['variants'][i]['options'] = variantOptionArr } data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100; data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100 } data[k]['description'] = data[k]['content'] = data[k]['body_html']; } return data };

/* Start Fix version 2.3.2 */
BCSfFilter.prototype.addFilterTreeItem=function(e,r,t,i){e=jQ.parseHTML(e),i=void 0!==i?i:this.getSelector("filterTree");void 0!==r&&"before"==r?jQ(i+t).prepend(e):jQ(i+t).append(e)};
/* End Fix version 2.3.2 */