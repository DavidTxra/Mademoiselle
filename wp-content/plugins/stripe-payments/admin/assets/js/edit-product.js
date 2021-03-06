var aspVariationsGroupsId = 0;
jQuery(document).ready(function ($) {
    var aspVariationsGroups = aspEditProdData.varGroups;
    var aspVariationsNames = aspEditProdData.varNames;
    var aspVariationsPrices = aspEditProdData.varPrices;
    var aspVariationsUrls = aspEditProdData.varUrls;
    function asp_create_variations_group(aspGroupId, groupName, focus) {
	$('span.asp-variations-no-variations-msg').hide();
	tpl_html = $('div.asp-html-tpl-variations-group').html();
	tpl_html = $.parseHTML(tpl_html);
	$(tpl_html).find('input.asp-variations-group-name').attr('name', 'asp-variations-group-names[' + aspGroupId + ']');
	$(tpl_html).find('input.asp-variations-group-name').val(groupName);
	$(tpl_html).closest('div.asp-variations-group-cont').attr('data-asp-group-id', aspGroupId);
	$('div#asp-variations-cont').append(tpl_html);
	if (focus) {
	    $(tpl_html).find('input.asp-variations-group-name').focus();
	}
    }
    function asp_add_variation(aspGroupId, variationName, variationPrice, variationUrl, focus) {
	tpl_html = $('table.asp-html-tpl-variation-row tbody').html();
	tpl_html = $.parseHTML(tpl_html);
	$(tpl_html).find('input.asp-variation-name').attr('name', 'asp-variation-names[' + aspGroupId + '][]');
	$(tpl_html).find('input.asp-variation-name').val(variationName);
	$(tpl_html).find('input.asp-variation-price').attr('name', 'asp-variation-prices[' + aspGroupId + '][]');
	$(tpl_html).find('input.asp-variation-price').val(variationPrice);
	$(tpl_html).find('input.asp-variation-url').attr('name', 'asp-variation-urls[' + aspGroupId + '][]');
	$(tpl_html).find('input.asp-variation-url').val(variationUrl);
	$('div.asp-variations-group-cont[data-asp-group-id="' + aspGroupId + '"]').find('table.asp-variations-tbl').append(tpl_html);
	if (focus) {
	    $(tpl_html).find('input.asp-variation-name').focus();
	}
    }
    $('button#asp-create-variations-group-btn').click(function (e) {
	e.preventDefault();
	asp_create_variations_group(aspVariationsGroupsId, '', true);
	aspVariationsGroupsId++;
    });
    $(document).on('click', 'button.asp-variations-delete-group-btn', function (e) {
	e.preventDefault();
	if (!confirm(aspEditProdData.str.groupDeleteConfirm)) {
	    return false;
	}
	$(this).closest('div.asp-variations-group-cont').remove();
	if ($('div.asp-variations-group-cont').length <= 1) {
	    $('span.asp-variations-no-variations-msg').show();
	}
    });
    $(document).on('click', 'button.asp-variations-delete-variation-btn', function (e) {
	e.preventDefault();
	if (!confirm(aspEditProdData.str.varDeleteConfirm)) {
	    return false;
	}
	$(this).closest('tr').remove();
    });
    $(document).on('click', 'button.asp-variations-add-variation-btn', function (e) {
	e.preventDefault();
	aspGroupId = $(this).closest('div.asp-variations-group-cont').data('asp-group-id');
	asp_add_variation(aspGroupId, '', 0, '', true);
    });
    $(document).on('click', 'button.asp-variations-select-from-ml-btn', function (e) {
	e.preventDefault();
	var asp_selectVarFile = wp.media({
	    title: "Select File",
	    button: {
		text: "Insert"
	    },
	    multiple: false
	});
	var buttonEl = $(this);
	asp_selectVarFile.open();
	asp_selectVarFile.on('select', function () {
	    var attachment_var = asp_selectVarFile.state().get('selection').first().toJSON();
	    $(buttonEl).closest('tr').children().find('input.asp-variation-url').val(attachment_var.url);
	});
	return false;
    });
    if (aspVariationsGroups.length !== 0) {
	$.each(aspVariationsGroups, function (index, item) {
	    aspVariationsGroupsId = index;
	    asp_create_variations_group(index, item, false);
	    if (aspVariationsNames !== null) {
		$.each(aspVariationsNames[index], function (index, item) {
		    asp_add_variation(aspVariationsGroupsId, item, aspVariationsPrices[aspVariationsGroupsId][index], aspVariationsUrls[aspVariationsGroupsId][index], false);
		});
	    }
	});
	if (aspVariationsGroupsId !== 0) {
	    aspVariationsGroupsId++;
	}
    }
});