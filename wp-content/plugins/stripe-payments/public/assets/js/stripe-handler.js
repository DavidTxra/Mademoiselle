var wp_asp_prefetched = false;

stripehandler.log = (function ($mod, $msg) {
    if (this.debug) {
	console.log('[StripePayments]' + $mod + ': ' + $msg);
    }
});

stripehandler.apply_tax = (function (amount, data) {
    if (data.tax !== 0) {
	var tax = Math.round(amount * parseInt(data.tax) / 100);
	amount = parseInt(amount) + parseInt(tax);
    }
    return amount;
});

stripehandler.apply_tax_and_shipping = (function (amount, data) {
    amount = stripehandler.apply_tax(amount, data);
    if (data.shipping !== 0) {
	amount = amount + parseInt(data.shipping);
    }
    return amount;
});

stripehandler.is_zero_cents = (function (curr) {
    if (stripehandler.zeroCents.indexOf(curr) === -1) {
	return false;
    }
    return true;
});

stripehandler.cents_to_amount = (function (amount, curr) {
    if (stripehandler.zeroCents.indexOf(curr) === -1) {
	amount = amount / 100;
    }
    return amount;
});

stripehandler.amount_to_cents = function (amount, curr) {
    if (stripehandler.zeroCents.indexOf(curr) === -1) {
	amount = amount * 100;
    }
    return parseFloat(amount);
}

stripehandler.formatMoney = (function (n, data) {
    n = stripehandler.cents_to_amount(n, data.currency);
    var c = isNaN(c = Math.abs(data.currencyFormat.c)) ? 2 : data.currencyFormat.c,
	    d = d == undefined ? "." : data.currencyFormat.d,
	    t = t == undefined ? "," : data.currencyFormat.t,
	    s = n < 0 ? "-" : "",
	    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
	    j = (j = i.length) > 3 ? j % 3 : 0;

    var result = s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    return (data.currencyFormat.pos !== "right" ? data.currencyFormat.s + result : result + data.currencyFormat.s);
});

stripehandler.updateAllAmounts = function (data) {
    var totValue;
    if (data.variable) {
	var amt = wp_asp_validate_custom_amount(data, false);
	if (amt !== false) {
	    data.item_price = amt;
	} else {
	    return false;
	}
    } else {
	totValue = data.item_price * data.quantity;
    }
    var totalCont = jQuery('form#stripe_form_' + data.uniq_id).parent().siblings('.asp_price_container');
    if (data.discount) {
	var couponVal = stripehandler.apply_coupon(totValue, data);
	couponVal = stripehandler.apply_tax_and_shipping(couponVal, data);
	totNew = totalCont.find('span.asp_tot_new_price');
	if (totNew.length !== 0) {
	    totNew.html(stripehandler.formatMoney(couponVal, data));
	} else {
	    totalCont.find('span.asp_new_price_amount').html(stripehandler.formatMoney(couponVal, data));
	}
    }
    totValue = stripehandler.apply_tax_and_shipping(totValue, data);
    totalCont.children().find('span.asp_tot_current_price').html(stripehandler.formatMoney(totValue, data));
    totalCont.find('span.asp_price_amount').html(stripehandler.formatMoney(data.item_price, data));
    var taxVal = false;
    if (data.tax !== 0) {
	var taxVal = Math.round(data.item_price * parseInt(data.tax) / 100) * data.quantity;
    }
    if (taxVal) {
	var taxStr = data.displayStr.tax.replace('%s', stripehandler.formatMoney(taxVal, data));
	totalCont.children().find('span.asp_price_tax_section').html(taxStr);
    }
    var qntStr = '';
    if (data.quantity !== 1) {
	qntStr = 'x ' + data.quantity;
    }
    totalCont.find('span.asp_quantity').html(qntStr);
    if (data.descrGenerated) {
	var descrAmt = totValue;
	if (data.discount) {
	    descrAmt = couponVal;
	}
	data.description = data.quantity + ' X ' + stripehandler.formatMoney(descrAmt, data);
    }
}

stripehandler.apply_coupon = (function (amount, data) {
    var discountAmount = 0;
    if (typeof data.discount !== "undefined") {
	if (data.discountType === 'perc') {
	    discountAmount = Math.round(amount * (data.discount / 100));
	} else {
	    discountAmount = data.discount * 100;
	    if (stripehandler.is_zero_cents(data.currency)) {
		discountAmount = Math.round(discountAmount / 100);
	    }
	}
	amount = amount - discountAmount;
	data.discountAmount = discountAmount;
    }
    return amount;
});

jQuery(document).ready(function () {
    jQuery('input[data-stripe-button-uid]').each(function (ind, obj) {
	var uid = jQuery(obj).data('stripeButtonUid');
	if (typeof (window['stripehandler' + uid]) !== 'undefined') {
	    if (!window['stripehandler' + uid].data.core_attached) {
		wp_asp_add_stripe_handler(window['stripehandler' + uid].data);
		window['stripehandler' + uid].data.core_attached = true;
	    }
	}
    });
    jQuery('select.asp-product-variations-select').change();
});

function wp_asp_validate_custom_quantity(data) {
    var custom_quantity_orig = jQuery('input#stripeCustomQuantity_' + data.uniq_id).val();
    var custom_quantity = parseInt(custom_quantity_orig);
    if (isNaN(custom_quantity)) {
	jQuery('#error_explanation_quantity_' + data.uniq_id).hide().html(stripehandler.strEnterQuantity).fadeIn('slow');
	return false;
    } else if (custom_quantity_orig % 1 !== 0) {
	jQuery('#error_explanation_quantity_' + data.uniq_id).hide().html(stripehandler.strQuantityIsFloat).fadeIn('slow');
	return false;
    } else if (custom_quantity === 0) {
	jQuery('#error_explanation_quantity_' + data.uniq_id).hide().html(stripehandler.strQuantityIsZero).fadeIn('slow');
	return false;
    } else {
	return custom_quantity;
    }
}

function wp_asp_validate_custom_amount(data, noTaxAndShipping) {
    var amount = jQuery('input#stripeAmount_' + data.uniq_id).val();
    if (stripehandler.amountOpts.applySepOpts != 0) {
	amount = amount.replace(stripehandler.amountOpts.thousandSep, '');
	amount = amount.replace(stripehandler.amountOpts.decimalSep, '.');
    } else {
	amount = amount.replace(/\$/g, '');
	amount = amount.replace(/\,/g, '');
    }
    amount = parseFloat(amount);

    if (isNaN(amount)) {
	jQuery('#error_explanation_' + data.uniq_id).hide().html(stripehandler.strEnterValidAmount).fadeIn('slow');
	return false;
    }

    var displayAmount = amount.toString();
    if (stripehandler.amountOpts.applySepOpts != 0) {
	displayAmount = displayAmount.replace('.', stripehandler.amountOpts.decimalSep);
    }
    if (data.zeroCents.indexOf(data.currency) <= -1) {
	amount = Math.round(amount * 100);
    }
    if (typeof stripehandler.minAmounts[data.currency] !== 'undefined') {
	if (stripehandler.minAmounts[data.currency] > amount) {
	    jQuery('#error_explanation_' + data.uniq_id).hide().html(stripehandler.strMinAmount + ' ' + stripehandler.cents_to_amount(stripehandler.minAmounts[data.currency], data.currency)).fadeIn('slow');
	    return false;
	}
    } else if (50 > amount) {
	jQuery('#error_explanation_' + data.uniq_id).hide().html(stripehandler.strMinAmount + ' 0.5').fadeIn('slow');
	return false;
    }
    jQuery('#error_explanation_' + data.uniq_id).html('');
    jQuery('input#stripeAmount_' + data.uniq_id).val(displayAmount);

    if (typeof noTaxAndShipping === 'undefined') {
	noTaxAndShipping = false;
    }
    if (!noTaxAndShipping) {
	amount = stripehandler.apply_tax_and_shipping(amount, data);
    }
    return amount;
}

function wp_asp_can_proceed(data, openHandler) {

    function button_clicked_hooks(data) {
	if (data.addonHooks.length !== 0) {
	    data.addonHooks.forEach(function (hookName) {
		if (typeof window["wp_asp_button_clicked_" + hookName] === "function") {
		    data.executingHook = "wp_asp_button_clicked_" + hookName;
		    data = window["wp_asp_button_clicked_" + hookName](data);
		    data.executingHook = "";
		}
	    });
	}
	return data;
    }

    if (data.variable) {
	var amount = wp_asp_validate_custom_amount(data, true);
	if (amount === false) {
	    return false;
	}
	data.item_price = wp_asp_validate_custom_amount(data, true);
    }

    if (typeof amount === "undefined") {
	amount = stripehandler.apply_coupon(data.item_price, data);
    } else {
	amount = stripehandler.apply_coupon(amount, data);
    }

    if (data.custom_quantity === "1") {
	var custom_quantity = wp_asp_validate_custom_quantity(data);
	if (custom_quantity !== false) {
	    amount = custom_quantity * amount;
	    data.quantity = custom_quantity;
	} else {
	    return false;
	}
    }

    amount = stripehandler.apply_tax_and_shipping(amount, data);

    var description = data.description;

    if (description === '') {

	var descr_quantity = 1;

	if (typeof custom_quantity !== "undefined") {
	    descr_quantity = custom_quantity;
	} else {
	    descr_quantity = data.quantity;
	}

	description = ' X ' + descr_quantity;
    }

    if (data.custom_field != '0') {
	jQuery('form#stripe_form_' + data.uniq_id).find('.asp_product_custom_field_error').hide();
	customInputs = jQuery('form#stripe_form_' + data.uniq_id).find('.asp_product_custom_field_input').toArray();
	var valid = true;
	jQuery.each(customInputs, function (id, customInput) {
	    customInput = jQuery(customInput);
	    if (typeof (customInput.attr('data-asp-custom-mandatory')) !== "undefined") {
		if (customInput.attr('type') === 'text' && customInput.val() === '') {
		    jQuery(this).siblings('.asp_product_custom_field_error').hide().html(stripehandler.strPleaseFillIn).fadeIn('slow');
		    return valid = false;
		}
		if (customInput.attr('type') === 'checkbox' && customInput.prop('checked') !== true) {
		    jQuery(this).parent().siblings('.asp_product_custom_field_error').hide().html(stripehandler.strPleaseCheckCheckbox).fadeIn('slow');
		    return valid = false;
		}
	    }
	});
	if (!valid) {
	    return false;
	}
    }

    if (data.tos == 1) {
	if (jQuery('#asp-tos-' + data.uniq_id).prop('checked') !== true) {
	    jQuery('#tos_error_explanation_' + data.uniq_id).hide().html(stripehandler.strMustAcceptTos).fadeIn('slow');
	    return false;
	}
    }

    data.canProceed = true;

    data.totalAmount = amount;

    data = button_clicked_hooks(data);

    if (!data.canProceed) {
	return false;
    }

    if (!openHandler) {
	return true;
    }

    if (typeof (amount) === "undefined") {
	data.handler.open({
	    description: description
	});
    } else {
	data.handler.open({
	    amount: amount,
	    description: description
	});
    }

    return true;
}

function wp_asp_hadnle_token(data, token, args) {
    jQuery('input#stripeToken_' + data.uniq_id).val(token.id);
    jQuery('input#stripeTokenType_' + data.uniq_id).val(token.type);
    jQuery('input#stripeEmail_' + data.uniq_id).val(token.email);
    form = jQuery('form#stripe_form_' + data.uniq_id);
    for (var key in args) {
	inputName = key.replace(/[^_]+/g, function (word) {
	    return word.replace(/^./, function (first) {
		return first.toUpperCase();
	    });
	});
	inputName = 'stripe' + inputName.replace(/[_]/g, '');
	form.append('<input type="hidden" name="' + inputName + '" value="' + args[key] + '">')
    }
    jQuery('#stripe_button_' + data.uniq_id).html(jQuery('.asp-processing-cont').html());
    jQuery('#stripe_button_' + data.uniq_id).prop('disabled', true);

    if (data.addonHooks.length !== 0) {
	data.addonHooks.forEach(function (hookName) {
	    if (typeof window["wp_asp_before_form_submit_" + hookName] === "function") {
		window["wp_asp_before_form_submit_" + hookName](data);
	    }
	});
    }

    form.append('<input type="hidden" name="clickProcessed" value="1">');
    form.off('submit');
    form.submit();
}

function wp_asp_add_stripe_handler(data) {

    function wp_asp_check_handler(data) {
	if (typeof (data.handler) === "undefined") {

	    var handler_opts = {
		key: stripehandler.key,
		amount: data.amount,
		locale: data.locale,
		description: data.description,
		name: data.name,
		currency: data.currency,
		image: data.image,
		allowRememberMe: data.allowRememberMe,
		token: function (token, args) {
		    wp_asp_hadnle_token(data, token, args);
		}
	    };

	    if (data.billingAddress) {
		handler_opts.billingAddress = data.billingAddress;
		handler_opts.shippingAddress = data.shippingAddress;
	    }

	    if (data.customer_email !== '') {
		handler_opts.email = data.customer_email;
	    }

	    if (data.verifyZip !== 0) {
		handler_opts.zipCode = true;
	    }

	    if (data.addonHooks.length !== 0) {
		data.addonHooks.forEach(function (hookName) {
		    if (typeof window["wp_asp_before_handler_configure_" + hookName] === "function") {
			handler_opts = window["wp_asp_before_handler_configure_" + hookName](handler_opts, data);
		    }
		});
	    }
	    data.handler = StripeCheckout.configure(handler_opts);
	}
    }

    if (!wp_asp_prefetched) {
	wp_asp_prefetched = true;
	wp_asp_check_handler(data);
    }

    jQuery('#stripe_form_' + data.uniq_id).on('submit', function (e) {
	e.preventDefault();
	jQuery('#stripe_button_' + data.uniq_id).click();
    });

    jQuery('input#asp-redeem-coupon-btn-' + data.uniq_id).click(function (e) {
	e.preventDefault();
	var couponCode = jQuery(this).siblings('input#asp-coupon-field-' + data.uniq_id).val();
	if (couponCode === '') {
	    return false;
	}
	var aspCouponBtn = jQuery(this);
	var aspCouponSpinner = jQuery(jQuery.parseHTML('<div class="asp-spinner">Loading...</div>'));
	aspCouponBtn.prop('disabled', true);
	aspCouponBtn.after(aspCouponSpinner);
	var ajaxData = {
	    'action': 'asp_check_coupon',
	    'product_id': data.product_id,
	    'coupon_code': couponCode,
	    'curr': data.currency,
	    'amount': data.item_price,
	    'tax': data.tax,
	    'shipping': data.shipping
	};
	jQuery.post(stripehandler.ajax_url, ajaxData, function (response) {
	    if (response.success) {
		data.discount = response.discount;
		data.discountType = response.discountType;
		data.couponCode = response.code;
		jQuery('div#asp-coupon-info-' + data.uniq_id).html(response.discountStr + ' <input type="button" class="asp_btn_normalize asp_coupon_apply_btn" id="asp-remove-coupon-' + data.uniq_id + '" title="' + stripehandler.strRemoveCoupon + '" value="' + stripehandler.strRemove + '">');
		jQuery('input#asp-redeem-coupon-btn-' + data.uniq_id).hide();
		jQuery('input#asp-coupon-field-' + data.uniq_id).hide();
		var totalCont = jQuery('form#stripe_form_' + data.uniq_id).parent().siblings('.asp_price_container');
		var totCurr;
		var totNew;
		if (totalCont.find('.asp_price_full_total').length !== 0) {
		    totCurr = totalCont.children().find('span.asp_tot_current_price').addClass('asp_line_through');
		    totNew = totalCont.children().find('span.asp_tot_new_price');
		} else {
		    totCurr = totalCont.find('span.asp_price_amount').addClass('asp_line_through');
		    totNew = totalCont.find('span.asp_new_price_amount');
		}
		stripehandler.updateAllAmounts(data);
		jQuery('#asp-remove-coupon-' + data.uniq_id).on('click', function (e) {
		    e.preventDefault();
		    jQuery('div#asp-coupon-info-' + data.uniq_id).html('');
		    jQuery('input#asp-coupon-field-' + data.uniq_id).val('');
		    jQuery('input#asp-coupon-field-' + data.uniq_id).show();
		    jQuery('input#asp-redeem-coupon-btn-' + data.uniq_id).show();
		    totCurr.removeClass('asp_line_through');
		    totNew.html('');
		    delete data.discount;
		    delete data.discountType;
		    delete data.couponCode;
		    delete data.newAmountFmt;
		});
	    } else {
		jQuery('div#asp-coupon-info-' + data.uniq_id).html(response.msg);
	    }
	    aspCouponSpinner.remove();
	    aspCouponBtn.prop('disabled', false);
	});
    });

    jQuery('input#asp-coupon-field-' + data.uniq_id).keydown(function (e) {
	if (e.keyCode === 13)
	{
	    e.preventDefault();
	    jQuery('input#asp-redeem-coupon-btn-' + data.uniq_id).click();
	    return false;
	}
    });

    jQuery('#stripe_button_' + data.uniq_id).on('click', function (e) {

	e.preventDefault();

	wp_asp_check_handler(data);

	data.buttonClicked = jQuery(this);

	return wp_asp_can_proceed(data, true);

    });

    jQuery('select.asp-product-variations-select').change(function () {
	var grpId = jQuery(this).data('asp-variations-group-id');
	var varId = jQuery(this).val();
	if (data.variations.applied) {
	    if (data.variations.applied[grpId] !== undefined)
		data.item_price = parseFloat(data.item_price) - stripehandler.amount_to_cents(data.variations.prices[grpId][data.variations.applied[grpId]], data.currency);
	} else {
	    data.variations.applied = [];
	}
	data.variations.applied[grpId] = varId;
	data.item_price = data.item_price + stripehandler.amount_to_cents(data.variations.prices[grpId][varId], data.currency);
	stripehandler.updateAllAmounts(data);
    });

    jQuery('div.asp_product_item_qty_input_container').children('.asp_product_item_qty_input').change(function () {
	var qnt = wp_asp_validate_custom_quantity(data);
	if (qnt !== false) {
	    data.quantity = qnt;
	    stripehandler.updateAllAmounts(data);
	}
    });

    jQuery('#stripe_button_' + data.uniq_id).prop("disabled", false);

}